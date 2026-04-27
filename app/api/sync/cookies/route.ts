import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401, headers: CORS });
  }

  const { cookies, pubSlug, pubName, handle } = await req.json();
  if (!cookies || !pubSlug) {
    return NextResponse.json({ error: "Missing cookies or pubSlug" }, { status: 400, headers: CORS });
  }

  await prisma.substackConnection.upsert({
    where: { userId: session.user.id },
    update: {
      encryptedCookies: encrypt(cookies),
      cookiesValid: true,
      publicationName: pubName ?? null,
      substackHandle: handle ?? null,
      lastSyncedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      publicationUrl: `https://${pubSlug}.substack.com`,
      publicationName: pubName ?? null,
      substackHandle: handle ?? null,
      encryptedCookies: encrypt(cookies),
      cookiesValid: true,
    },
  });

  return NextResponse.json({ ok: true, message: "Cookies saved" }, { headers: CORS });
}
