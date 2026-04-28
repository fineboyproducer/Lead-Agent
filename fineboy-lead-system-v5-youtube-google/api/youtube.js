export default async function handler(req, res) {
  const { action = "search", query, maxResults = "6" } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing YOUTUBE_API_KEY in Vercel Environment Variables" });
  if (action !== "search") return res.status(400).json({ error: "Invalid action. Use action=search" });
  if (!query) return res.status(400).json({ error: "Missing query" });
  const safeMax = Math.min(parseInt(maxResults, 10) || 6, 10);
  const publishedAfter = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString();
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(safeMax));
  url.searchParams.set("order", "date");
  url.searchParams.set("publishedAfter", publishedAfter);
  url.searchParams.set("key", apiKey);
  try {
    const response = await fetch(url.toString());
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || `YouTube failed ${response.status}`, details: data });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "YouTube proxy failed" });
  }
}
