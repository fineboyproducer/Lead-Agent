export default async function handler(req, res) {
  const subreddit = String(req.query.subreddit || "").replace(/[^a-zA-Z0-9_]/g, "");
  const limit = Math.min(parseInt(req.query.limit || "10", 10) || 10, 25);

  if (!subreddit) return res.status(400).json({ error: "Missing subreddit" });

  try {
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}&raw_json=1`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "FineboyLeadAgent/1.0"
      }
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Reddit ${subreddit} failed: ${response.status}` });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Reddit proxy failed" });
  }
}
