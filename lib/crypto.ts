import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const KEY = Buffer.from(
  (process.env.AUTH_SECRET ?? "").padEnd(32, "0").slice(0, 32)
);
const ALGO = "aes-256-cbc";

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(data: string): string {
  const [ivHex, encHex] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv(ALGO, KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
