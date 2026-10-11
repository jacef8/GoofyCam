// Tiny static server for Railway (no packages needed). Railway gives the HTTPS the camera needs.
const http = require("http"), fs = require("fs"), path = require("path");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".json": "application/json", ".ico": "image/x-icon" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(__dirname, path.normalize(p).replace(/^(\.\.[\/\\])+/, ""));
  if (!file.startsWith(__dirname) || p.includes("server.js") || p.includes("package.json")) { res.writeHead(404); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
      "Cache-Control": p.endsWith(".html") || p.endsWith("sw.js") ? "no-cache" : "public, max-age=3600" });
    res.end(data);
  });
}).listen(process.env.PORT || 3000, () => console.log("Goofy Cam running"));
