import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import healthz from "./api/healthz.js";
import createPaste from "./api/pastes.js";
import getPaste from "./api/pasteById.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// APIs
app.get("/api/healthz", healthz);
app.post("/api/pastes", createPaste);
app.get("/api/pastes/:id", getPaste);

// HTML view for paste
app.get("/p/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "paste.html"));
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <h1>Pastebin Lite</h1>
    <p>Use the API to create pastes.</p>
    <p>Health check: <a href="/api/healthz">/api/healthz</a></p>
  `);
});


app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
