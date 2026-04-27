import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { fetchPublicationData } from "@/lib/substack";

// Manual sync trigger — user clicks "Sync" in the dashboard
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const conn = await prisma.substackConnection.findUnique({
    where: { userId: session.user.id },
  });

  if (!conn) {
    return NextResponse.json({ error: "No Substack connected. Install the Chrome extension." }, { status: 400 });
  }

  if (!conn.cookiesValid) {
    return NextResponse.json({ error: "Cookies expired. Open Chrome to refresh." }, { status: 400 });
  }

  try {
    const cookies = decrypt(conn.encryptedCookies);
    const pubSlug = new URL(conn.publicationUrl).hostname.split(".")[0];
    const { publication, posts, topPosts } = await fetchPublicationData(pubSlug, cookies);

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
          userId: session.user.id,
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
          userId: session.user.id,
          restacks: p.restacks ?? 0,
          likes: totalReactions,
          publishDayOfWeek: publishDate.getUTCDay(),
          publishHour: publishDate.getUTCHours(),
        },
      });

      synced++;
    }

    await prisma.substackConnection.update({
      where: { userId: session.user.id },
      data: { publicationName: publication?.name ?? conn.publicationName, lastSyncedAt: new Date() },
    });

    return NextResponse.json({ message: `Synced ${synced} posts` });
  } catch (e) {
    if ((e as Error).message === "COOKIES_EXPIRED") {
      await prisma.substackConnection.update({
        where: { userId: session.user.id },
        data: { cookiesValid: false },
      });
      return NextResponse.json({ error: "Cookies expired. Open Chrome to refresh." }, { status: 400 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
