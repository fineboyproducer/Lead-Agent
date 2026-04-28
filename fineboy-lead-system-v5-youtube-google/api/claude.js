export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing ANTHROPIC_API_KEY in Vercel Environment Variables",
      fix: "Add ANTHROPIC_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy."
    });
  }

  try {
    const payload = {
      max_tokens: 900,
      ...req.body,
      // Stable, cheaper model for classification + reply drafting.
      // You can switch this to claude-sonnet-4-6 later if you want stronger drafts.
      model: req.body?.model || "claude-haiku-4-5-20251001"
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.message || `Anthropic API failed: ${response.status}`,
        type: data?.error?.type || "anthropic_error",
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Claude proxy failed" });
  }
}
