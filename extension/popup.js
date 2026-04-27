const pub = document.getElementById("pub");
const meta = document.getElementById("meta");
const btn = document.getElementById("relay");
const status = document.getElementById("status");

chrome.runtime.sendMessage({ action: "status" }, (res) => {
  if (res?.ok && res.result?.substack) {
    const dot = res.result.publication ? "green" : "yellow";
    pub.innerHTML = `<span class="dot ${dot}"></span>` +
      (res.result.publication
        ? `Connected: <strong>${res.result.publication}</strong>`
        : "Logged in, detecting publication…");
    meta.textContent = `Last synced: ${res.result.lastRelay || "Never"}`;
    btn.disabled = false;
  } else {
    pub.innerHTML = `<span class="dot red"></span> Not connected`;
    status.textContent = res?.result?.error || "Log into substack.com first.";
    status.className = "err";
  }
});

btn.addEventListener("click", () => {
  btn.disabled = true;
  status.textContent = "Sending cookies to SubSutra…";
  status.className = "info";

  chrome.runtime.sendMessage({ action: "relay" }, (res) => {
    btn.disabled = false;
    if (res?.ok) {
      if (res.result?.queued) {
        status.textContent = "⏳ Queued — open localhost:3000 to complete";
        status.className = "info";
      } else {
        status.textContent = "✓ Cookies synced! Server will fetch data automatically.";
        status.className = "ok";
        meta.textContent = `Last synced: ${new Date().toLocaleString()}`;
      }
    } else {
      status.textContent = `✗ ${res?.error || "Failed"}`;
      status.className = "err";
    }
  });
});
