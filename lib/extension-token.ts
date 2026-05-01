import { createHmac } from "crypto";

const SECRET = process.env.AUTH_SECRET!;
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function createExtensionToken(userId: string): string {
  const payload = `${userId}.${Date.now() + TTL_MS}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyExtensionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [userId, exp, sig] = decoded.split(".");
    if (!userId || !exp || !sig) return null;

    const expected = createHmac("sha256", SECRET).update(`${userId}.${exp}`).digest("hex");
    if (sig !== expected) return null;
    if (Date.now() > Number(exp)) return null;

    return userId;
  } catch {
    return null;
  }
}
