const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;

// Path to messages.json
const MSG_FILE = path.join(__dirname, "storage", "messages.json");

// Ensure messages.json exists
if (!fs.existsSync(MSG_FILE)) {
  fs.writeFileSync(MSG_FILE, "[]", "utf8");
}

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Helper: serve static files
function serveStatic(req, res) {
  let filePath = path.join(
    __dirname,
    "public",
    req.url === "/" ? "index.html" : req.url
  );

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".ico": "image/x-icon",
      };
      const contentType = mimeTypes[ext] || "text/plain";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
}

// Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // API endpoint
  if (parsedUrl.pathname === "/api") {
    if (req.method === "GET") {
      const messages = JSON.parse(fs.readFileSync(MSG_FILE, "utf8"));
      return sendJson(res, 200, messages);
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          const { text, timestamp, sender } = JSON.parse(body);

          if (!text) {
            return sendJson(res, 400, { error: "Invalid payload" });
          }

          let messages = JSON.parse(fs.readFileSync(MSG_FILE, "utf8"));

          const newMessage = {
            id:
              Date.now().toString(36) +
              Math.random().toString(36).substring(2, 5),
            text,
            timestamp:
              timestamp ||
              new Date().toISOString().slice(0, 16).replace("T", " "),
            sender: sender || "user",
          };

          messages.push(newMessage);
          fs.writeFileSync(MSG_FILE, JSON.stringify(messages, null, 2));

          sendJson(res, 200, { status: "ok" });
        } catch (err) {
          sendJson(res, 400, { error: "Invalid JSON" });
        }
      });
      return;
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  }

  // Serve static frontend
  serveStatic(req, res);
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
