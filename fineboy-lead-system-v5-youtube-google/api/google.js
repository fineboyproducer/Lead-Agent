export default async function handler(req, res) {
  const { query, maxResults = "6" } = req.query;
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing SERPAPI_KEY in Vercel Environment Variables" });
  if (!query) return res.status(400).json({ error: "Missing query" });
  const safeMax = Math.min(parseInt(maxResults, 10) || 6, 10);
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("num", String(safeMax));
  url.searchParams.set("api_key", apiKey);
  try {
    const response = await fetch(url.toString());
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) return res.status(response.status || 500).json({ error: data.error || `SerpAPI failed ${response.status}`, details: data });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Google proxy failed" });
  }
}
