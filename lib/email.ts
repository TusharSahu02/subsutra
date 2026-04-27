import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "SubSutra <noreply@subsutra.com>";

export async function sendCookieExpiryEmail(to: string, name: string | null) {
  const firstName = name?.split(" ")[0] ?? "there";

  await resend.emails.send({
    from: FROM,
    to,
    subject: "⚠️ SubSutra lost connection to your Substack",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
        <h2 style="color: #111; margin-bottom: 16px;">Hey ${firstName} 👋</h2>
        <p style="color: #333; line-height: 1.6; margin-bottom: 16px;">
          Your Substack session has expired, so SubSutra can't sync your latest post data.
        </p>
        <p style="color: #333; line-height: 1.6; margin-bottom: 24px;">
          To fix this, just <strong>open Substack in Chrome</strong> (the browser where you installed the SubSutra extension). That's it — the extension will automatically pick up your fresh session and resume syncing.
        </p>
        <a href="https://substack.com" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Open Substack →
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 32px; line-height: 1.5;">
          Once you visit Substack, your browser refreshes the session cookies and SubSutra picks them up automatically. No extra steps needed.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #bbb; font-size: 12px;">
          🔮 SubSutra — Analytics for Substack creators
        </p>
      </div>
    `,
  });
}
