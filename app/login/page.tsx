import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--surface-base)" }}
    >
      <div className="w-full max-w-sm px-6 py-10 flex flex-col gap-8">

        {/* Wordmark */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="11" fill="#ff6719" />
              <path d="M7 11l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              SubSutra
            </span>
          </div>
          <h1
            className="text-2xl font-semibold tracking-tight leading-snug"
            style={{ color: "var(--text-primary)", fontSize: "var(--font-size-lg)" }}
          >
            Analytics for serious<br />Substack creators
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-xs)" }}>
            Post scores, growth spikes, best publish times, and conversion insights — all in one place.
          </p>
        </div>

        {/* Sign in */}
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/dashboard" })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
            style={{
              backgroundColor: "var(--surface-raised)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xs)",
              boxShadow: "var(--shadow-1)",
              transitionDuration: "var(--motion-instant)",
            }}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Social proof */}
        <div
          className="border-t pt-6 flex flex-col gap-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {[
            { stat: "Post Performance Scorer", desc: "A–F grades on every post" },
            { stat: "Growth Timeline", desc: "See exactly what caused each spike" },
            { stat: "Best Time to Publish", desc: "Personalized to your audience" },
          ].map((item) => (
            <div key={item.stat} className="flex items-start gap-3">
              <div
                className="mt-0.5 size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "var(--accent-orange)" }}
                aria-hidden="true"
              />
              <div>
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.stat}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {" "}— {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p
          className="text-center"
          style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-xs)" }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
