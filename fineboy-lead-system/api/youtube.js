export default async function handler(req, res) {
  const { action, query, videoId, maxResults = "8", apiKey } = req.query;
  if (!apiKey) return res.status(400).json({ error: "Missing YouTube API key" });

  try {
    let url;
    if (action === "search") {
      if (!query) return res.status(400).json({ error: "Missing YouTube search query" });
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3&key=${encodeURIComponent(apiKey)}`;
    } else if (action === "comments") {
      if (!videoId) return res.status(400).json({ error: "Missing videoId" });
      const safeMax = Math.min(parseInt(maxResults, 10) || 8, 20);
      url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${encodeURIComponent(videoId)}&maxResults=${safeMax}&order=relevance&key=${encodeURIComponent(apiKey)}`;
    } else {
      return res.status(400).json({ error: "Invalid YouTube action" });
    }

    const response = await fetch(url);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || `YouTube failed: ${response.status}` });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "YouTube proxy failed" });
  }
}
