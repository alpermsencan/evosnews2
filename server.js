/**
 * Hostinger ve Node.js sunucuları için Next.js üretim başlatıcı (entrypoint)
 */

// Hostinger Linux konteynerlerinde /etc/resolv.conf SRV DNS hatasını önlemek için mongodb+srv bağlantısını doğrudan replika setine dönüştür
if (
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith("mongodb+srv://") &&
  process.env.DATABASE_URL.includes("cluster0.mbkkusx.mongodb.net")
) {
  process.env.DATABASE_URL = process.env.DATABASE_URL
    .replace("mongodb+srv://", "mongodb://")
    .replace(
      "cluster0.mbkkusx.mongodb.net",
      "ac-rnu0lc1-shard-00-00.mbkkusx.mongodb.net:27017,ac-rnu0lc1-shard-00-01.mbkkusx.mongodb.net:27017,ac-rnu0lc1-shard-00-02.mbkkusx.mongodb.net:27017"
    );
  if (!process.env.DATABASE_URL.includes("replicaSet=")) {
    const sep = process.env.DATABASE_URL.includes("?") ? "&" : "?";
    process.env.DATABASE_URL += `${sep}ssl=true&replicaSet=atlas-nzlu18-shard-0&authSource=admin`;
  }
}

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
