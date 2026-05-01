import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createExtensionToken } from "@/lib/extension-token";

// Called after Google OAuth completes — returns a signed token for the extension
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const token = createExtensionToken(session.user.id);
  return NextResponse.json({ token, userId: session.user.id });
}
