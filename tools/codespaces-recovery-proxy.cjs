const http = require("node:http");
const net = require("node:net");

const PORT = 4143;
const WEB_PORT = 4141;
const WISP_PORT = 4142;

const server = http.createServer((req, res) => {
  const upstream = http.request({
    host: "127.0.0.1",
    port: WEB_PORT,
    method: req.method,
    path: req.url,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${WEB_PORT}`,
    },
  }, (response) => {
    res.writeHead(response.statusCode || 502, response.headers);
    response.pipe(res);
  });

  upstream.on("error", (err) => {
    console.error("Web upstream error:", err.message);
    if (!res.headersSent) res.writeHead(502);
    res.end("Local web upstream unavailable");
  });

  req.pipe(upstream);
});

server.on("upgrade", (req, client, head) => {
  const upstream = net.connect(WISP_PORT, "127.0.0.1", () => {
    const lines = [
      `${req.method} ${req.url} HTTP/${req.httpVersion}`,
      ...Object.entries(req.headers).map(([k, v]) =>
        `${k}: ${Array.isArray(v) ? v.join(", ") : v}`
      ),
      "",
      "",
    ];

    upstream.write(lines.join("\r\n"));
    if (head.length) upstream.write(head);
    client.pipe(upstream);
    upstream.pipe(client);
  });

  upstream.on("error", (err) => {
    console.error("Wisp upstream error:", err.message);
    client.destroy();
  });

  client.on("error", () => upstream.destroy());
  client.on("close", () => upstream.destroy());
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Recovery proxy listening on ${PORT}`);
  console.log(`HTTP -> ${WEB_PORT}; WebSocket -> ${WISP_PORT}`);
});

server.on("error", (err) => {
  console.error("Recovery proxy failed:", err.message);
  process.exitCode = 1;
});
