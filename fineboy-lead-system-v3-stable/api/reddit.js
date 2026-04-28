let cachedToken = null;
let tokenExpiresAt = 0;

async function getRedditToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "FineboyLeadAgent/2.0 by FineboyProducer"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Reddit OAuth failed: ${response.status}`);
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  const subreddit = String(req.query.subreddit || "").replace(/[^a-zA-Z0-9_]/g, "");
  const limit = Math.min(parseInt(req.query.limit || "8", 10) || 8, 10);

  if (!subreddit) return res.status(400).json({ error: "Missing subreddit" });

  try {
    const token = await getRedditToken();
    const url = token
      ? `https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}&raw_json=1`
      : `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}&raw_json=1`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "FineboyLeadAgent/2.0 by FineboyProducer",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 500) }; }

    if (!response.ok) {
      const oauthHint = token
        ? "OAuth was used, but Reddit still rejected the request. Wait a few minutes, reduce scan size, or check Reddit app credentials."
        : "Public Reddit JSON was used. Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in Vercel to avoid 403 blocks.";
      return res.status(response.status).json({
        error: `Reddit ${subreddit} failed: ${response.status}`,
        hint: oauthHint,
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Reddit proxy failed" });
  }
}
