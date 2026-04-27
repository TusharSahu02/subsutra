import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { fetchPublicationData } from "@/lib/substack";
import { sendCookieExpiryEmail } from "@/lib/email";

// Protect with a secret so only your cron can call it
const CRON_SECRET = process.env.CRON_SECRET ?? "dev-cron-secret";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all users with valid cookies
  const connections = await prisma.substackConnection.findMany({
    where: { cookiesValid: true },
    include: { user: true },
  });

  const results: Array<{ userId: string; status: string; posts?: number }> = [];

  for (const conn of connections) {
    try {
      const cookies = decrypt(conn.encryptedCookies);
      const pubSlug = new URL(conn.publicationUrl).hostname.split(".")[0];

      const { publication, posts, topPosts } = await fetchPublicationData(pubSlug, cookies);

      // Upsert posts + metrics
      const allPosts = [...posts, ...topPosts];
      const seen = new Set<string>();
      let synced = 0;

      for (const p of allPosts) {
        const sid = String(p.id);
        if (seen.has(sid)) continue;
        seen.add(sid);

        const totalReactions = Object.values(p.reactions ?? {}).reduce(
          (s: number, v) => s + (v as number), 0
        );

        const post = await prisma.post.upsert({
          where: { substackPostId: sid },
          update: {
            title: p.title,
            slug: p.slug ?? null,
            publishedAt: new Date(p.post_date),
            isPaywalled: p.audience === "only_paid",
          },
          create: {
            userId: conn.userId,
            substackPostId: sid,
            title: p.title,
            slug: p.slug ?? null,
            publishedAt: new Date(p.post_date),
            isPaywalled: p.audience === "only_paid",
          },
        });

        const publishDate = new Date(p.post_date);
        await prisma.postMetrics.upsert({
          where: { postId: post.id },
          update: {
            restacks: p.restacks ?? 0,
            likes: totalReactions,
            publishDayOfWeek: publishDate.getUTCDay(),
            publishHour: publishDate.getUTCHours(),
            fetchedAt: new Date(),
          },
          create: {
            postId: post.id,
            userId: conn.userId,
            restacks: p.restacks ?? 0,
            likes: totalReactions,
            publishDayOfWeek: publishDate.getUTCDay(),
            publishHour: publishDate.getUTCHours(),
          },
        });

        synced++;
      }

      // Update last synced
      await prisma.substackConnection.update({
        where: { id: conn.id },
        data: {
          publicationName: publication?.name ?? conn.publicationName,
          lastSyncedAt: new Date(),
        },
      });

      results.push({ userId: conn.userId, status: "ok", posts: synced });
    } catch (e) {
      const msg = (e as Error).message;

      if (msg === "COOKIES_EXPIRED") {
        await prisma.substackConnection.update({
          where: { id: conn.id },
          data: { cookiesValid: false },
        });

        // Email the user to re-visit Substack
        if (conn.user.email) {
          try {
            await sendCookieExpiryEmail(conn.user.email, conn.user.name);
          } catch {}
        }

        results.push({ userId: conn.userId, status: "cookies_expired_emailed" });
      } else {
        results.push({ userId: conn.userId, status: `error: ${msg}` });
      }
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
