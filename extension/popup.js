const authView = document.getElementById("auth-view");
const connectedView = document.getElementById("connected-view");
const connectBtn = document.getElementById("connect");
const pub = document.getElementById("pub");
const meta = document.getElementById("meta");
const relayBtn = document.getElementById("relay");
const disconnectBtn = document.getElementById("disconnect");
const status = document.getElementById("status");

function showConnected(info) {
  authView.classList.add("hidden");
  connectedView.classList.remove("hidden");
  const dot = info.publication ? "green" : info.substack ? "yellow" : "red";
  pub.innerHTML = `<span class="dot ${dot}"></span>` +
    (info.publication
      ? `Connected: <strong>${info.publication}</strong>`
      : info.substack === false
        ? "Log into substack.com to sync"
        : "Detecting publication…");
  meta.textContent = `Last synced: ${info.lastRelay || "Never"}`;
}

function showAuth() {
  authView.classList.remove("hidden");
  connectedView.classList.add("hidden");
}

// Check current state
chrome.runtime.sendMessage({ action: "status" }, (res) => {
  if (res?.ok && res.result?.authenticated) {
    showConnected(res.result);
  } else {
    showAuth();
  }
});

// Connect: Google OAuth → auto-sync cookies
connectBtn.addEventListener("click", () => {
  connectBtn.disabled = true;
  status.textContent = "Opening Google login…";
  status.className = "info";

  chrome.runtime.sendMessage({ action: "authenticate" }, (res) => {
    connectBtn.disabled = false;
    if (res?.ok) {
      status.textContent = "✓ Connected! Syncing cookies…";
      status.className = "ok";
      // Auto-sync immediately after auth
      chrome.runtime.sendMessage({ action: "relay" }, (syncRes) => {
        if (syncRes?.ok && syncRes.result?.status === "ok") {
          status.textContent = "✓ All set! Your analytics are syncing.";
          status.className = "ok";
        }
        // Refresh view
        chrome.runtime.sendMessage({ action: "status" }, (s) => {
          if (s?.ok && s.result?.authenticated) showConnected(s.result);
        });
      });
    } else {
      status.textContent = `✗ ${res?.error || "Login failed"}`;
      status.className = "err";
    }
  });
});

// Manual sync
relayBtn.addEventListener("click", () => {
  relayBtn.disabled = true;
  status.textContent = "Syncing…";
  status.className = "info";

  chrome.runtime.sendMessage({ action: "relay" }, (res) => {
    relayBtn.disabled = false;
    if (res?.ok && res.result?.status === "ok") {
      status.textContent = "✓ Synced!";
      status.className = "ok";
      meta.textContent = `Last synced: ${new Date().toLocaleString()}`;
    } else if (res?.ok && res.result?.status === "not_authenticated") {
      status.textContent = "Session expired — please reconnect";
      status.className = "err";
      showAuth();
    } else {
      status.textContent = `✗ ${res?.error || res?.result?.status || "Failed"}`;
      status.className = "err";
    }
  });
});

// Disconnect
disconnectBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "disconnect" }, () => {
    showAuth();
    status.textContent = "";
  });
});
