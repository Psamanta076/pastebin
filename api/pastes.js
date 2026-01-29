import { nanoid } from "nanoid";
import { pool } from "../db.js";

export default async function (req, res) {
  const { content, ttl_seconds, max_views } = req.body;

  // validation
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds !== undefined && ttl_seconds < 1) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views !== undefined && max_views < 1) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  const id = nanoid(8);
  const expiresAt = ttl_seconds
    ? new Date(Date.now() + ttl_seconds * 1000)
    : null;

  await pool.query(
    `INSERT INTO pastes (id, content, expires_at, max_views)
     VALUES ($1, $2, $3, $4)`,
    [id, content, expiresAt, max_views || null]
  );

  res.status(201).json({
    id,
    url: `http://localhost:3000/p/${id}`
  });
}