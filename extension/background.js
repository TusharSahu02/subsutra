// SubSutra Chrome Extension — Cookie Relay
// Captures Substack cookies and sends them to SubSutra server.
// The SERVER does the actual syncing on a cron schedule.

const SUBSUTRA_URL = "http://localhost:3000";

// ─── Get all Substack cookies ────────────────────────────────────────────────

async function getSubstackCookies() {
  const [a, b, c] = await Promise.all([
    chrome.cookies.getAll({ domain: ".substack.com" }),
    chrome.cookies.getAll({ domain: "substack.com" }),
    chrome.cookies.getAll({ url: "https://substack.com" }),
  ]);
  const map = new Map();
  [...a, ...b, ...c].forEach((ck) => map.set(ck.name, ck.value));
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function hasSid(cookieStr) {
  return cookieStr.includes("substack.sid=");
}

// ─── Detect publication (via tab injection into substack.com) ────────────────

async function detectPublication() {
  const tabs = await chrome.tabs.query({ url: "https://*.substack.com/*" });
  let tabId;

  if (tabs.length) {
    tabId = tabs[0].id;
  } else {
    // Briefly open substack.com to detect handle
    const tab = await chrome.tabs.create({ url: "https://substack.com", active: false });
    await new Promise((r) => {
      const listener = (id, info) => {
        if (id === tab.id && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          r();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
    tabId = tab.id;
  }

  // Try handle/options
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: async () => {
      try {
        // Strategy 1: handle/options
        const res = await fetch("https://substack.com/api/v1/handle/options", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          let handle = null;
          if (Array.isArray(data)) {
            handle = (data.find((h) => h.type === "existing") || data[0])?.handle;
          } else if (data?.potentialHandles) {
            handle = (data.potentialHandles.find((h) => h.type === "existing") || data.potentialHandles[0])?.handle;
          } else if (data?.handle) {
            handle = data.handle;
          }

          if (handle) {
            // Get publication info
            const pRes = await fetch(
              `https://substack.com/api/v1/user/${handle}/public_profile`,
              { credentials: "include", headers: { Accept: "application/json" } }
            );
            if (pRes.ok) {
              const profile = await pRes.json();
              const pub = profile?.publicationUsers?.[0]?.publication;
              if (pub) return { handle, pubSlug: pub.subdomain, pubName: pub.name };
            }
          }
        }

        // Strategy 2: __NEXT_DATA__
        const el = document.getElementById("__NEXT_DATA__");
        if (el) {
          const pp = JSON.parse(el.textContent)?.props?.pageProps;
          const h = pp?.user?.handle || pp?.profile?.handle;
          if (h) return { handle: h, pubSlug: h, pubName: null };
        }

        return null;
      } catch {
        return null;
      }
    },
  });

  // Close tab if we created it
  if (!tabs.length) chrome.tabs.remove(tabId).catch(() => {});

  return results?.[0]?.result;
}

// ─── Send cookies to SubSutra server ─────────────────────────────────────────

async function sendCookiesToServer(cookies, pubInfo) {
  // Post via SubSutra tab (session cookie needed for auth)
  const tabs = await chrome.tabs.query({ url: `${SUBSUTRA_URL}/*` });
  if (!tabs.length) {
    // Store locally, will retry later
    await chrome.storage.local.set({ pendingCookies: cookies, pendingPub: pubInfo });
    return { queued: true };
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: async (url, body) => {
      try {
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) return { error: `HTTP ${res.status}` };
        return { data: await res.json() };
      } catch (e) {
        return { error: e.message };
      }
    },
    args: [
      `${SUBSUTRA_URL}/api/sync/cookies`,
      {
        cookies,
        pubSlug: pubInfo.pubSlug,
        pubName: pubInfo.pubName,
        handle: pubInfo.handle,
      },
    ],
  });

  const r = results?.[0]?.result;
  if (r?.error) throw new Error(r.error);
  return r?.data;
}

// ─── Main sync function ──────────────────────────────────────────────────────

async function relayCookies() {
  const cookies = await getSubstackCookies();
  if (!hasSid(cookies)) return { status: "no_session" };

  const pubInfo = await detectPublication();
  if (!pubInfo) return { status: "no_publication" };

  const result = await sendCookiesToServer(cookies, pubInfo);
  await chrome.storage.local.set({ lastRelay: Date.now() });
  return { status: "ok", ...result };
}

// ─── Auto-run on browser startup ─────────────────────────────────────────────

chrome.runtime.onStartup.addListener(() => {
  relayCookies().catch(() => {});
});

// Also run on install
chrome.runtime.onInstalled.addListener(() => {
  relayCookies().catch(() => {});
});

// Run every 6 hours via alarm
chrome.alarms.create("cookie-relay", { periodInMinutes: 360 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cookie-relay") relayCookies().catch(() => {});
});

// ─── Message handler (popup can trigger manual relay + status check) ─────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "relay") {
    relayCookies()
      .then((result) => sendResponse({ ok: true, result }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
  if (msg.action === "status") {
    checkStatus()
      .then((result) => sendResponse({ ok: true, result }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});

async function checkStatus() {
  const cookies = await getSubstackCookies();
  if (!hasSid(cookies)) return { substack: false, error: "Not logged into Substack" };

  const pubInfo = await detectPublication();
  if (!pubInfo) return { substack: true, publication: null, error: "Could not detect publication" };

  const { lastRelay } = await chrome.storage.local.get("lastRelay");
  return {
    substack: true,
    publication: pubInfo.pubName || pubInfo.pubSlug,
    slug: pubInfo.pubSlug,
    lastRelay: lastRelay ? new Date(lastRelay).toLocaleString() : "Never",
  };
}
