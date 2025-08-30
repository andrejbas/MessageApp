const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Path to messages.json
const MSG_FILE = path.join(__dirname, "storage", "messages.json");

// Ensure messages.json exists
if (!fs.existsSync(MSG_FILE)) {
  fs.writeFileSync(MSG_FILE, "[]", "utf8");
}

// Middleware
app.use(express.json());

// POST /api → save a message
app.post("/api", (req, res) => {
  const { text, timestamp, sender } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  let messages = JSON.parse(fs.readFileSync(MSG_FILE, "utf8"));

  const newMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    text,
    timestamp: timestamp || new Date().toISOString().slice(0, 16).replace("T", " "),
    sender: sender || "user",
  };

  messages.push(newMessage);
  fs.writeFileSync(MSG_FILE, JSON.stringify(messages, null, 2));

  res.json({ status: "ok" });
});

// GET /api → fetch all messages
app.get("/api", (req, res) => {
  const messages = JSON.parse(fs.readFileSync(MSG_FILE, "utf8"));
  res.json(messages);
});

// Handle invalid methods
app.all("/api", (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
});

// Serve public folder (your frontend)
app.use(express.static(path.join(__dirname, "public")));

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});