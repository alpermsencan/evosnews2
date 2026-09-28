/**
 * Hostinger ve Node.js sunucuları için Next.js üretim başlatıcı (entrypoint)
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const path = require("path");
const fs = require("fs");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";

// Standalone derleme varsa doğrudan onu çalıştır
const standalonePath = path.join(__dirname, ".next", "standalone", "server.js");
if (fs.existsSync(standalonePath)) {
  process.env.PORT = String(port);
  process.env.HOSTNAME = hostname;
  require(standalonePath);
} else {
  // Standalone yoksa standart next server'ı çalıştır
  const app = next({ dev, hostname, port, dir: __dirname });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", req.url, err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    })
      .once("error", (err) => {
        console.error("Server error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> EVOtoPilot Next.js sunucusu hazır: http://${hostname}:${port}`);
      });
  });
}
