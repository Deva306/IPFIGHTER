importScripts("/c/controller.sw.js");

const { shouldRoute, route } = $scramjetController;

function buildProtectionScript(sid, tz, off, sec, prot) {
  var code = "";

  // Storage/cookie isolation removed — scramjet already isolates storage and
  // cookies per proxied origin; the custom layer was redundant and conflicted.

  // Security
  if (sec.blockKeyboardShortcuts) code += 'document.addEventListener("keydown",function(e){if(e.key==="F12"||(e.ctrlKey&&e.shiftKey&&(e.key==="I"||e.key==="J"||e.key==="C"))||(e.ctrlKey&&e.key==="u"))e.preventDefault()});';
  if (sec.blockRightClick) code += 'window.addEventListener("contextmenu",function(e){e.preventDefault()},true);';
  if (sec.blockDevTools) code += 'setInterval(function(){var s=new Date;debugger;if(new Date-s>100)window.location.href="/"},50);';

  // WebRTC block
  if (prot.blockWebRTC) code += 'var O=window.RTCPeerConnection;if(O){window.RTCPeerConnection=function(c,s){if(c&&c.iceServers)c.iceServers=[];return new O(c,s)};window.RTCPeerConnection.prototype=O.prototype}var W=window.webkitRTCPeerConnection;if(W){window.webkitRTCPeerConnection=function(c,s){if(c&&c.iceServers)c.iceServers=[];return new W(c,s)};window.webkitRTCPeerConnection.prototype=W.prototype}';

  // Timezone spoof (safe: getTimezoneOffset + Intl.DateTimeFormat only)
  if (prot.spoofTimezone) code += 'var tz="' + tz + '",off=' + off + ';var D=Intl.DateTimeFormat;Intl.DateTimeFormat=function(){var a=[].slice.call(arguments);if(a[1])a[1].timeZone=a[1].timeZone||tz;else a[1]={timeZone:tz};return new D(a[0],a[1])};Intl.DateTimeFormat.prototype=D.prototype;Intl.DateTimeFormat.supportedLocalesOf=D.supportedLocalesOf.bind(D);var rO=D.prototype.resolvedOptions;D.prototype.resolvedOptions=function(){var r=rO.call(this);r.timeZone=tz;return r};Date.prototype.getTimezoneOffset=function(){return off};';

  // Aggressive Date method overrides (can break sites like YouTube)
  if (prot.spoofTimezone && prot.spoofDateMethods) code += 'var sign=off<=0?"+":"-",ah=Math.floor(Math.abs(off)/60),am=Math.abs(off)%60;var gmtStr="GMT"+sign+(ah<10?"0":"")+ah+(am<10?"0":"")+am;var days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function tzParts(d){var f=new D("en-US",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",weekday:"short",hour12:false});var p={};f.formatToParts(d).forEach(function(x){p[x.type]=x.value});return p}function tzLongName(){try{var n=new D("en-US",{timeZone:tz,timeZoneName:"long"}).formatToParts(new Date()).find(function(p){return p.type==="timeZoneName"});return n?n.value:tz}catch(e){return tz}}var longName=tzLongName();Date.prototype.toString=function(){var p=tzParts(this);return p.weekday+" "+months[parseInt(p.month)-1]+" "+p.day+" "+p.year+" "+p.hour+":"+p.minute+":"+p.second+" "+gmtStr+" ("+longName+")"};Date.prototype.toTimeString=function(){var p=tzParts(this);return p.hour+":"+p.minute+":"+p.second+" "+gmtStr+" ("+longName+")"};Date.prototype.toDateString=function(){var p=tzParts(this);return p.weekday+" "+months[parseInt(p.month)-1]+" "+p.day+" "+p.year};Date.prototype.toLocaleString=function(l,o){o=o||{};o.timeZone=o.timeZone||tz;return new D(l||undefined,o).format(this)};Date.prototype.toLocaleDateString=function(l,o){o=o||{};o.timeZone=o.timeZone||tz;if(!o.year&&!o.month&&!o.day){o.year="numeric";o.month="2-digit";o.day="2-digit"}return new D(l||undefined,o).format(this)};Date.prototype.toLocaleTimeString=function(l,o){o=o||{};o.timeZone=o.timeZone||tz;if(!o.hour&&!o.minute&&!o.second){o.hour="2-digit";o.minute="2-digit";o.second="2-digit"}return new D(l||undefined,o).format(this)};Date.prototype.getHours=function(){return parseInt(tzParts(this).hour)};Date.prototype.getMinutes=function(){return parseInt(tzParts(this).minute)};Date.prototype.getSeconds=function(){return parseInt(tzParts(this).second)};Date.prototype.getDate=function(){return parseInt(tzParts(this).day)};Date.prototype.getDay=function(){var w=tzParts(this).weekday;return days.indexOf(w)};Date.prototype.getMonth=function(){return parseInt(tzParts(this).month)-1};Date.prototype.getFullYear=function(){return parseInt(tzParts(this).year)};';

  // Language spoof (window.navigator only — no Accept-Language header spoof,
  // which wrapped window.fetch and could conflict with scramjet).
  if (prot.spoofLanguage) code += 'if(navigator.language!=="en-US"){var lang="en-US",langs=Object.freeze(["en-US","en"]);try{Object.defineProperty(Navigator.prototype,"language",{get:function(){return lang},configurable:true})}catch(e){}try{Object.defineProperty(Navigator.prototype,"languages",{get:function(){return langs},configurable:true})}catch(e){}try{Object.defineProperty(navigator,"language",{get:function(){return lang},configurable:true})}catch(e){}try{Object.defineProperty(navigator,"languages",{get:function(){return langs},configurable:true})}catch(e){}}';

  if (!code) return "";

  return `<script data-ipf="1">(function(){
if(window.__ipfProtected)return;window.__ipfProtected=true;
${code}
})();</scrip` + `t>`;
}

// Single source for session/runtime config (protections + direct-load lists).
// Fetched once per SW lifetime — no extra endpoint needed.
let _infoPromise = null;
function getProxyInfo() {
  if (!_infoPromise) {
    _infoPromise = Promise.race([
      fetch("/api/proxy-info").then((r) => r.json()),
      new Promise((r) => setTimeout(() => r({}), 5000)),
    ]).catch(() => ({}));
  }
  return _infoPromise;
}

const _CACHE_KEY = "ipf-protection-script";
let _protectionScript = null;
let _protectionScriptPromise = null;

function getProtectionScript() {
  if (_protectionScript !== null) return Promise.resolve(_protectionScript);
  if (_protectionScriptPromise) return _protectionScriptPromise;
  _protectionScriptPromise = caches.open(_CACHE_KEY)
    .then(cache => cache.match("/_ipf_script"))
    .then(cached => {
      if (cached) return cached.text().then(s => { _protectionScript = s; return s; });
      return getProxyInfo()
        .then(info => {
          _protectionScript = buildProtectionScript(
            info.sid || "",
            info.timezone || "UTC",
            info.offset || 0,
            info.security || {},
            info.protections || {}
          );
          return caches.open(_CACHE_KEY)
            .then(cache => cache.put("/_ipf_script", new Response(_protectionScript)))
            .then(() => _protectionScript);
        });
    })
    .catch(() => _protectionScript || "")
    .finally(() => { _protectionScriptPromise = null; });
  return _protectionScriptPromise;
}

const TRANSPORT_DEAD_HTML =
  '<!DOCTYPE html><html><head><meta name="ipf-transport-dead" content="1"/></head>' +
  '<body style="margin:0;background:#0d0d0f;color:#888;display:flex;align-items:center;' +
  'justify-content:center;height:100vh;font-family:system-ui">Reconnecting…</body></html>';

// Strip Set-Cookie from the browser-facing response. Scramjet already captured
// the cookie into its own jar during route(); leaving the header would also set
// the proxied site's cookie on our real origin (webproxy.ipfighter.com).
function stripSetCookie(headers) {
  if (!headers.has("set-cookie")) return headers;
  const cleaned = new Headers();
  for (const [k, v] of headers.entries()) {
    if (k.toLowerCase() !== "set-cookie") cleaned.append(k, v);
  }
  return cleaned;
}

// --- Explicitly blocked sites -------------------------------------------
const BLOCKED_DOMAINS = [];
function isBlockedDomain(host) {
  if (!host) return false;
  host = host.toLowerCase();
  return BLOCKED_DOMAINS.some((d) => host === d || host.endsWith("." + d));
}
// Decode the real target URL out of a proxied request URL. Scramjet's path is
// /p/<clientId>/<frameId>/<codec-encoded-url> — the encoded URL is the LAST
// segment (codec-encoded slashes are %2F, so it is always a single segment).
function proxiedTargetUrl(reqUrl) {
  try {
    const u = new URL(reqUrl);
    if (!u.pathname.startsWith("/p/")) return null;
    const segs = u.pathname.split("/").filter(Boolean);
    const encoded = segs[segs.length - 1];
    if (!encoded) return null;
    const real = decodeURIComponent(encoded);
    if (!/^https?:\/\//i.test(real)) return null;
    return real;
  } catch { return null; }
}
function proxiedTargetHost(reqUrl) {
  const real = proxiedTargetUrl(reqUrl);
  try { return real ? new URL(real).hostname : null; } catch { return null; }
}

// --- Direct-load bypass --------------------------------------------------
// Extensions and domains that bypass the proxy (fetched straight from origin).
// Hardcoded — no server round-trip needed.
const DIRECT_EXTENSIONS = [
  "jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "ico", "bmp",
  "mp4", "webm", "mp3", "m4a", "ogg",
  "woff", "woff2", "ttf", "otf",
];
const DIRECT_DOMAINS = [
  "ytimg.com", "ggpht.com", "googleusercontent.com", "gstatic.com",
  "fbcdn.net", "cdninstagram.com", "twimg.com", "redd.it", "imgur.com",
  "licdn.com", "pinimg.com",
];
function urlExtension(u) {
  try {
    const m = new URL(u).pathname.match(/\.([a-z0-9]+)$/i);
    return m ? m[1].toLowerCase() : null;
  } catch { return null; }
}
function shouldLoadDirect(realUrl) {
  let host = null;
  try { host = new URL(realUrl).hostname.toLowerCase(); } catch { return false; }
  if (DIRECT_DOMAINS.some((d) => host === d || host.endsWith("." + d))) return true;
  const ext = urlExtension(realUrl);
  return !!ext && DIRECT_EXTENSIONS.indexOf(ext) !== -1;
}
function blockedPage(host) {
  const safe = String(host).replace(/[<>&"]/g, "");
  return (
    '<!DOCTYPE html><html><head><meta charset="utf-8"/>' +
    '<meta name="ipf-blocked" content="1"/><title>Site blocked</title></head>' +
    '<body style="margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;' +
    'justify-content:center;text-align:center;padding:24px;background:#0d0d0f;color:#e8e8ea;' +
    'font-family:system-ui,sans-serif">' +
    '<div style="font-size:52px;margin-bottom:14px">&#128683;</div>' +
    '<div style="font-size:20px;font-weight:700;margin-bottom:8px">This site is blocked</div>' +
    '<div style="font-size:14px;color:#9a9aa2;max-width:420px;line-height:1.5"><b style="color:#e8e8ea">' +
    safe + '</b> is not available through this proxy.</div></body></html>'
  );
}
function isNavigation(request) {
  return (
    request.mode === "navigate" ||
    request.destination === "document" ||
    request.destination === "iframe"
  );
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// Tunneling through a datacenter proxy, a single connection often drops mid-way
// ("tls handshake eof", GOAWAY, broken pipe) and surfaces as a thrown error or
// a 5xx. Retry idempotent requests a few times so one dropped connection does
// not break the page (e.g. a CDN script like Alpine failing to load).
async function routeWithRetry(event) {
  const m = event.request.method;
  const idempotent = m === "GET" || m === "HEAD";
  const tries = idempotent ? 3 : 1;
  let response = null;
  for (let i = 0; i < tries; i++) {
    try {
      response = await route(event);
      if (response && response.headers) {
        const retryable = idempotent && response.status >= 500 && response.status < 600;
        if (!retryable || i === tries - 1) return response;
      }
    } catch (e) {
      if (i === tries - 1) throw e;
    }
    await sleep(150 * (i + 1));
  }
  return response;
}

async function handleRoute(event) {
  // Blocked-site guard: intercept blocked top-level navigations up front.
  if (isNavigation(event.request)) {
    const host = proxiedTargetHost(event.request.url);
    if (isBlockedDomain(host)) {
      return new Response(blockedPage(host), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  // Direct-load bypass: admin-listed extensions/domains are fetched straight
  // from the origin instead of going through the proxy.
  // Only sub-resources — never a document/iframe navigation, which must be
  // rewritten by the proxy. Fonts are always cors-fetched so they never match.
  // NOTE: a bypassed script/stylesheet arrives UNREWRITTEN; scramjet's runtime
  // hooks still intercept its fetch/XHR, but the file itself is fetched with the
  // visitor's real IP.
  // Sub-resource destinations that may bypass. "" covers assets pulled by JS
  // (fetch/XHR). document/iframe are deliberately absent — a navigation must
  // always be rewritten by the proxy.
  const dest = event.request.destination;
  const BYPASSABLE = ["image", "video", "audio", "script", "style", "font", ""];
  if (BYPASSABLE.indexOf(dest) !== -1) {
    const real = proxiedTargetUrl(event.request.url);
    if (real && shouldLoadDirect(real)) {
      try {
        // A cors request cannot consume an opaque response, so fetch it in cors
        // mode (works when the origin sends ACAO; throws otherwise and we fall
        // back to the proxy). Everything else uses no-cors.
        const init = event.request.mode === "cors"
          ? { credentials: "omit" }
          : { mode: "no-cors", credentials: "omit" };
        return await fetch(real, init);
      } catch {
        // direct load failed → fall through to the proxy below
      }
    }
  }

  let response;
  try {
    response = await routeWithRetry(event);
  } catch (e) {
    return new Response(TRANSPORT_DEAD_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!response || !response.headers) {
    return new Response(TRANSPORT_DEAD_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }

  const headers = stripSetCookie(response.headers);
  const ct = headers.get("content-type") || "";

  if (!ct.includes("text/html")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const script = await getProtectionScript();
  if (!script) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const html = await response.text();

  let modified;
  const headMatch = html.match(/<head[^>]*>/i);
  if (headMatch) {
    const idx = headMatch.index + headMatch[0].length;
    modified = html.slice(0, idx) + script + html.slice(idx);
  } else {
    modified = script + html;
  }

  return new Response(modified, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Lightweight health-check ping from the page — confirms the SW is alive and
// that the scramjet controller is still initialized (shouldRoute exists).
self.addEventListener("message", (event) => {
  if (event.data === "ipf_ping") {
    event.source.postMessage("ipf_pong");
  }
});

// Take control as soon as possible and stay in control of open clients, so
// proxied (/p/) requests are always intercepted instead of falling through
// to the server (which would serve our 404 page).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (shouldRoute(event)) {
    event.respondWith(handleRoute(event));
  } else if (new URL(event.request.url).pathname.startsWith("/p/")) {
    // Request is in our scope but scramjet didn't claim it (cold restart lost
    // routing state). Return the transport-dead signal so the page can recover.
    event.respondWith(
      new Response(TRANSPORT_DEAD_HTML, {
        status: 503,
        headers: { "Content-Type": "text/html" },
      })
    );
  }
});
