// SubSutra Chrome Extension — Simplified Cookie Relay
// Install → Connect (Google OAuth) → auto-syncs cookies forever.

const SUBSUTRA_URL = "http://localhost:3000";

// ─── Auth token management ───────────────────────────────────────────────────

async function getToken() {
  const { subsutraToken } = await chrome.storage.local.get("subsutraToken");
  return subsutraToken || null;
}

async function saveToken(token) {
  await chrome.storage.local.set({ subsutraToken: token });
}

async function clearToken() {
  await chrome.storage.local.remove("subsutraToken");
}

// ─── Google OAuth via SubSutra ───────────────────────────────────────────────
// Opens SubSutra's Google login in a new tab, then fetches the extension token.

async function authenticate() {
  // Open login page, wait for it to complete, then grab the token
  const tab = await chrome.tabs.create({ url: `${SUBSUTRA_URL}/login?from=extension`, active: true });

  return new Promise((resolve, reject) => {
    const onUpdated = async (tabId, info) => {
      if (tabId !== tab.id || info.status !== "complete") return;

      // Check if we're back on the dashboard (login succeeded)
      const t = await chrome.tabs.get(tabId);
      if (!t.url?.includes(SUBSUTRA_URL) || t.url?.includes("/login")) return;

      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.onRemoved.removeListener(onRemoved);

      try {
        // Fetch extension token using the active session
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: async (url) => {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) return null;
            return res.json();
          },
          args: [`${SUBSUTRA_URL}/api/auth/extension`],
        });

        const data = results?.[0]?.result;
        if (data?.token) {
          await chrome.storage.local.set({ subsutraToken: data.token });
          chrome.tabs.remove(tabId).catch(() => {});
          resolve(data.token);
        } else {
          reject(new Error("Could not get token after login"));
        }
      } catch (e) {
        reject(e);
      }
    };

    const onRemoved = (tabId) => {
      if (tabId === tab.id) {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        chrome.tabs.onRemoved.removeListener(onRemoved);
        reject(new Error("Login tab closed"));
      }
    };

    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.onRemoved.addListener(onRemoved);
  });
}

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

// ─── Detect publication ──────────────────────────────────────────────────────

async function detectPublication() {
  const tabs = await chrome.tabs.query({ url: "https://*.substack.com/*" });
  let tabId, created = false;

  if (tabs.length) {
    tabId = tabs[0].id;
  } else {
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
    created = true;
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: async () => {
      try {
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
            const pRes = await fetch(`https://substack.com/api/v1/user/${handle}/public_profile`, {
              credentials: "include",
              headers: { Accept: "application/json" },
            });
            if (pRes.ok) {
              const profile = await pRes.json();
              const pub = profile?.publicationUsers?.[0]?.publication;
              if (pub) return { handle, pubSlug: pub.subdomain, pubName: pub.name };
            }
          }
        }
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

  if (created) chrome.tabs.remove(tabId).catch(() => {});
  return results?.[0]?.result;
}

// ─── Send cookies directly to server (token auth, no tab injection) ──────────

async function sendCookiesToServer(cookies, pubInfo) {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated — please connect first");

  const res = await fetch(`${SUBSUTRA_URL}/api/sync/cookies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cookies,
      pubSlug: pubInfo.pubSlug,
      pubName: pubInfo.pubName,
      handle: pubInfo.handle,
    }),
  });

  if (res.status === 401) {
    await clearToken();
    throw new Error("Token expired — please reconnect");
  }
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}

// ─── Main sync ───────────────────────────────────────────────────────────────

async function relayCookies() {
  const token = await getToken();
  if (!token) return { status: "not_authenticated" };

  const cookies = await getSubstackCookies();
  if (!hasSid(cookies)) return { status: "no_session" };

  const pubInfo = await detectPublication();
  if (!pubInfo) return { status: "no_publication" };

  const result = await sendCookiesToServer(cookies, pubInfo);
  await chrome.storage.local.set({ lastRelay: Date.now() });
  return { status: "ok", ...result };
}

// ─── Auto-sync on startup + every 6 hours ────────────────────────────────────

chrome.runtime.onStartup.addListener(() => relayCookies().catch(() => {}));
chrome.runtime.onInstalled.addListener(() => relayCookies().catch(() => {}));

chrome.alarms.create("cookie-relay", { periodInMinutes: 360 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cookie-relay") relayCookies().catch(() => {});
});

// ─── Message handler for popup ───────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "authenticate") {
    authenticate()
      .then((token) => sendResponse({ ok: true, token }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
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
  if (msg.action === "disconnect") {
    clearToken()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }
});

async function checkStatus() {
  const token = await getToken();
  if (!token) return { authenticated: false };

  const cookies = await getSubstackCookies();
  if (!hasSid(cookies)) return { authenticated: true, substack: false };

  const pubInfo = await detectPublication();
  const { lastRelay } = await chrome.storage.local.get("lastRelay");

  return {
    authenticated: true,
    substack: true,
    publication: pubInfo?.pubName || pubInfo?.pubSlug || null,
    slug: pubInfo?.pubSlug || null,
    lastRelay: lastRelay ? new Date(lastRelay).toLocaleString() : "Never",
  };
}
