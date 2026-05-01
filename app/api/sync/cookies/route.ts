import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { verifyExtensionToken } from "@/lib/extension-token";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

async function resolveUserId(req: NextRequest): Promise<string | null> {
  // 1. Bearer token from extension
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifyExtensionToken(authHeader.slice(7));
  }
  // 2. Session cookie from website
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers: CORS });
  }

  const { cookies, pubSlug, pubName, handle } = await req.json();
  if (!cookies || !pubSlug) {
    return NextResponse.json({ error: "Missing cookies or pubSlug" }, { status: 400, headers: CORS });
  }

  await prisma.substackConnection.upsert({
    where: { userId },
    update: {
      encryptedCookies: encrypt(cookies),
      cookiesValid: true,
      publicationName: pubName ?? null,
      substackHandle: handle ?? null,
      lastSyncedAt: new Date(),
    },
    create: {
      userId,
      publicationUrl: `https://${pubSlug}.substack.com`,
      publicationName: pubName ?? null,
      substackHandle: handle ?? null,
      encryptedCookies: encrypt(cookies),
      cookiesValid: true,
    },
  });

  return NextResponse.json({ ok: true, message: "Cookies saved" }, { headers: CORS });
}
