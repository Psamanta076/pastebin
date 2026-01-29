import { pool } from "../db.js";

function getNow(req) {
  if (process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]) {
    return new Date(Number(req.headers["x-test-now-ms"]));
  }
  return new Date();
}

export default async function (req, res) {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      "SELECT * FROM pastes WHERE id=$1 FOR UPDATE",
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }

    const paste = result.rows[0];
    const now = getNow(req);

    if (
      (paste.expires_at && now > paste.expires_at) ||
      (paste.max_views && paste.view_count >= paste.max_views)
    ) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }

    await client.query(
      "UPDATE pastes SET view_count = view_count + 1 WHERE id=$1",
      [id]
    );

    await client.query("COMMIT");

    res.json({
      content: paste.content,
      remaining_views: paste.max_views
        ? paste.max_views - paste.view_count - 1
        : null,
      expires_at: paste.expires_at
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
}
