const fs = require("fs");
const http = require("http");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..", "dist-web");
const port = Number(process.env.PORT || 8083);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);
    if (!filePath.startsWith(root)) {
      send(res, 403, {}, "Forbidden");
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(root, "index.html");
    }

    const ext = path.extname(filePath);
    const body = fs.readFileSync(filePath);
    const acceptsGzip = /\bgzip\b/.test(req.headers["accept-encoding"] || "");
    const cacheControl = urlPath.startsWith("/_expo/")
      ? "public, max-age=31536000, immutable"
      : "no-cache";
    const headers = {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": cacheControl,
      "Vary": "Accept-Encoding",
    };

    if (acceptsGzip && (ext === ".js" || ext === ".css" || ext === ".html" || ext === ".json")) {
      zlib.gzip(body, { level: 9 }, (err, gzipped) => {
        if (err) {
          send(res, 500, {}, "Compression error");
          return;
        }
        send(res, 200, { ...headers, "Content-Encoding": "gzip" }, gzipped);
      });
      return;
    }

    send(res, 200, headers, body);
  })
  .listen(port, "0.0.0.0", () => {
    console.log(`Mobile web production server listening on http://0.0.0.0:${port}`);
  });
