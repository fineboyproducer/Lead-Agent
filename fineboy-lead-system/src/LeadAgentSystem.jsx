import { useState, useCallback, useRef } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#080808",
  surface: "#111111",
  card: "#161616",
  card2: "#1c1c1c",
  border: "#242424",
  border2: "#2e2e2e",
  gold: "#C8A84B",
  goldDim: "rgba(200,168,75,0.12)",
  goldBorder: "rgba(200,168,75,0.25)",
  red: "#E05252",
  green: "#4CAF82",
  blue: "#5B9BD5",
  text: "#E8E2D6",
  muted: "#5A5550",
  muted2: "#3A3530",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Geist+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: ${T.bg}; }
::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 2px; }

body { background: ${T.bg}; color: ${T.text}; font-family: 'Lora', Georgia, serif; }

.app {
  min-height: 100vh;
  background: ${T.bg};
  background-image:
    radial-gradient(ellipse 600px 400px at 0% 0%, rgba(200,168,75,0.04) 0%, transparent 70%),
    radial-gradient(ellipse 400px 600px at 100% 100%, rgba(91,155,213,0.03) 0%, transparent 70%);
}

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 32px;
  border-bottom: 1px solid ${T.border};
  background: rgba(8,8,8,0.96);
  position: sticky; top: 0; z-index: 200;
  backdrop-filter: blur(16px);
}

.wordmark {
  font-family: 'Syne', sans-serif;
  font-size: 18px; font-weight: 800;
  letter-spacing: -0.5px;
  color: ${T.text};
}
.wordmark em { color: ${T.gold}; font-style: normal; }

.status-pill {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Geist Mono', monospace;
  font-size: 10px; letter-spacing: 1px; text-transform: uppercase;
  color: ${T.muted};
  border: 1px solid ${T.border};
  padding: 5px 12px; border-radius: 20px;
}
.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: ${T.muted2};
  transition: background 0.3s;
}
.dot.active { background: ${T.green}; box-shadow: 0 0 8px ${T.green}; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.layout { display: grid; grid-template-columns: 300px 1fr; min-height: calc(100vh - 61px); }

/* SIDEBAR */
.sidebar {
  border-right: 1px solid ${T.border};
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 28px;
  background: ${T.surface};
  overflow-y: auto;
  max-height: calc(100vh - 61px);
  position: sticky; top: 61px;
}

.sidebar-section {}
.sidebar-label {
  font-family: 'Geist Mono', monospace;
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: ${T.muted}; margin-bottom: 10px; display: block;
}

.field { margin-bottom: 12px; }
.field-label {
  font-family: 'Geist Mono', monospace;
  font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase;
  color: ${T.muted}; display: block; margin-bottom: 5px;
}

input, textarea, select {
  width: 100%; background: ${T.card};
  border: 1px solid ${T.border}; color: ${T.text};
  padding: 9px 12px; border-radius: 3px;
  font-family: 'Geist Mono', monospace; font-size: 12px;
  outline: none; transition: border-color 0.2s; appearance: none;
}
input:focus, textarea:focus, select:focus { border-color: ${T.goldBorder}; }
textarea { resize: vertical; min-height: 80px; line-height: 1.6; font-size: 11px; }

.agent-toggle {
  display: flex; gap: 8px; margin-bottom: 14px;
}
.agent-btn {
  flex: 1; padding: 10px 8px;
  border: 1px solid ${T.border}; background: ${T.card};
  color: ${T.muted}; border-radius: 3px; cursor: pointer;
  font-family: 'Geist Mono', monospace; font-size: 10px;
  letter-spacing: 1px; text-transform: uppercase;
  transition: all 0.2s; text-align: center;
}
.agent-btn:hover { color: ${T.text}; border-color: ${T.border2}; }
.agent-btn.on {
  background: ${T.goldDim}; border-color: ${T.goldBorder};
  color: ${T.gold};
}

.run-btn {
  width: 100%; padding: 14px;
  background: ${T.gold}; color: #000;
  border: none; border-radius: 3px; cursor: pointer;
  font-family: 'Geist Mono', monospace;
  font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
  font-weight: 500; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.run-btn:hover { background: #dbb84f; transform: translateY(-1px); }
.run-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

.progress-section { display: flex; flex-direction: column; gap: 8px; }
.progress-item {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Geist Mono', monospace; font-size: 10px; color: ${T.muted};
}
.progress-item.done { color: ${T.green}; }
.progress-item.active { color: ${T.gold}; }
.progress-icon { width: 16px; text-align: center; }

/* MAIN */
.main { padding: 28px 32px; overflow-y: auto; }

.pipeline-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px;
}
.pipeline-title {
  font-family: 'Syne', sans-serif;
  font-size: 26px; font-weight: 800; letter-spacing: -0.5px;
}
.pipeline-title span { color: ${T.gold}; }

.stats-row {
  display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap;
}
.stat-card {
  flex: 1; min-width: 100px;
  background: ${T.card}; border: 1px solid ${T.border};
  border-radius: 4px; padding: 14px 16px;
}
.stat-num {
  font-family: 'Syne', sans-serif; font-size: 28px;
  font-weight: 800; line-height: 1;
  margin-bottom: 4px;
}
.stat-label {
  font-family: 'Geist Mono', monospace; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase; color: ${T.muted};
}

.filter-row {
  display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
}
.filter-chip {
  padding: 6px 14px;
  border: 1px solid ${T.border}; background: transparent;
  color: ${T.muted}; border-radius: 20px; cursor: pointer;
  font-family: 'Geist Mono', monospace; font-size: 10px;
  letter-spacing: 1px; text-transform: uppercase; transition: all 0.15s;
}
.filter-chip:hover { color: ${T.text}; border-color: ${T.border2}; }
.filter-chip.active { background: ${T.goldDim}; border-color: ${T.goldBorder}; color: ${T.gold}; }

/* LEAD CARDS */
.lead-card {
  background: ${T.card}; border: 1px solid ${T.border};
  border-radius: 6px; margin-bottom: 14px;
  overflow: hidden; transition: border-color 0.2s;
}
.lead-card:hover { border-color: ${T.border2}; }

.lead-card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px; cursor: pointer; gap: 12px;
}
.lead-card-header:hover { background: rgba(255,255,255,0.01); }

.lead-meta { flex: 1; min-width: 0; }
.lead-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }

.platform-badge {
  font-family: 'Geist Mono', monospace; font-size: 9px;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 2px;
}
.pb-reddit { background: rgba(255,69,0,0.15); color: #ff6935; border: 1px solid rgba(255,69,0,0.2); }
.pb-youtube { background: rgba(255,0,0,0.12); color: #ff4444; border: 1px solid rgba(255,0,0,0.15); }

.heat-badge {
  font-family: 'Geist Mono', monospace; font-size: 9px;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 2px;
}
.hb-hot { background: rgba(224,82,82,0.15); color: ${T.red}; border: 1px solid rgba(224,82,82,0.2); }
.hb-warm { background: rgba(200,168,75,0.12); color: ${T.gold}; border: 1px solid ${T.goldBorder}; }
.hb-cold { background: rgba(90,85,80,0.2); color: ${T.muted}; border: 1px solid ${T.border}; }

.lead-handle {
  font-family: 'Geist Mono', monospace; font-size: 12px;
  color: ${T.text}; font-weight: 500;
}
.lead-sub {
  font-family: 'Geist Mono', monospace; font-size: 10px;
  color: ${T.muted};
}
.lead-snippet {
  font-size: 13px; color: rgba(232,226,214,0.65);
  line-height: 1.5; margin-top: 4px;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

.lead-actions { display: flex; gap: 6px; align-items: flex-start; flex-shrink: 0; }

.icon-btn {
  background: transparent; border: 1px solid ${T.border};
  color: ${T.muted}; padding: 6px 10px; border-radius: 3px;
  cursor: pointer; font-family: 'Geist Mono', monospace;
  font-size: 10px; letter-spacing: 1px; transition: all 0.15s;
  white-space: nowrap;
}
.icon-btn:hover { color: ${T.text}; border-color: ${T.border2}; }
.icon-btn.copied { color: ${T.green}; border-color: rgba(76,175,130,0.3); }
.icon-btn.gold { color: ${T.gold}; border-color: ${T.goldBorder}; background: ${T.goldDim}; }

.lead-body {
  border-top: 1px solid ${T.border};
  background: #0d0d0d;
}

.reply-section { padding: 20px; }
.reply-label {
  font-family: 'Geist Mono', monospace; font-size: 9px;
  letter-spacing: 2px; text-transform: uppercase;
  color: ${T.gold}; margin-bottom: 12px; display: flex;
  align-items: center; gap: 8px;
}
.reply-label::after {
  content: ''; flex: 1; height: 1px;
  background: ${T.goldBorder};
}

.reply-text {
  font-size: 13px; line-height: 1.8; color: ${T.text};
  white-space: pre-wrap; background: ${T.card2};
  border: 1px solid ${T.border}; border-radius: 3px;
  padding: 16px; margin-bottom: 12px;
}

.reply-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.original-section {
  padding: 16px 20px; border-top: 1px solid ${T.border};
  background: rgba(0,0,0,0.2);
}
.original-label {
  font-family: 'Geist Mono', monospace; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: ${T.muted}; margin-bottom: 8px;
}
.original-text {
  font-size: 12px; line-height: 1.7; color: rgba(232,226,214,0.5);
  font-style: italic;
}

/* EMPTY / LOADING */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 80px 40px; text-align: center;
  color: ${T.muted};
}
.empty-icon { font-size: 40px; margin-bottom: 16px; opacity: 0.4; }
.empty-title { font-family: 'Syne', sans-serif; font-size: 18px; color: ${T.muted}; margin-bottom: 8px; }
.empty-sub { font-size: 13px; line-height: 1.6; max-width: 320px; }

.scanning-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 40px; text-align: center;
}
.scan-title { font-family: 'Syne', sans-serif; font-size: 20px; margin-bottom: 6px; }
.scan-sub { font-size: 13px; color: ${T.muted}; margin-bottom: 32px; }

.scan-bars { display: flex; gap: 4px; height: 40px; align-items: flex-end; }
.scan-bar {
  width: 6px; background: ${T.gold}; border-radius: 2px;
  animation: scanBar 1.2s ease-in-out infinite;
}
.scan-bar:nth-child(2) { animation-delay: 0.1s; }
.scan-bar:nth-child(3) { animation-delay: 0.2s; }
.scan-bar:nth-child(4) { animation-delay: 0.3s; }
.scan-bar:nth-child(5) { animation-delay: 0.4s; }
.scan-bar:nth-child(6) { animation-delay: 0.5s; }
@keyframes scanBar {
  0%,100% { height: 8px; opacity: 0.3; }
  50% { height: 40px; opacity: 1; }
}

.log-stream {
  background: ${T.card}; border: 1px solid ${T.border};
  border-radius: 4px; padding: 16px; max-width: 480px;
  width: 100%; margin-top: 24px; text-align: left;
  max-height: 160px; overflow-y: auto;
}
.log-line {
  font-family: 'Geist Mono', monospace; font-size: 11px;
  color: ${T.muted}; line-height: 1.8;
}
.log-line.ok { color: ${T.green}; }
.log-line.info { color: ${T.gold}; }

/* SETUP NOTICE */
.setup-card {
  background: ${T.card}; border: 1px solid ${T.goldBorder};
  border-radius: 6px; padding: 20px; margin-bottom: 24px;
}
.setup-title {
  font-family: 'Geist Mono', monospace; font-size: 10px;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: ${T.gold}; margin-bottom: 10px;
}
.setup-steps { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.setup-step {
  font-size: 13px; color: rgba(232,226,214,0.7);
  line-height: 1.6; display: flex; gap: 10px;
}
.step-num {
  font-family: 'Geist Mono', monospace; font-size: 11px;
  color: ${T.gold}; flex-shrink: 0; width: 18px;
}

a { color: ${T.gold}; text-decoration: none; }
a:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: static; max-height: none; }
  .main { padding: 20px; }
}
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SUBREDDITS = [
  "WeAreTheMusicMakers", "makinghiphop", "edmproduction",
  "trapproduction", "independentmusic", "SpotifyArtists", "musicproduction"
];

const YT_QUERIES = [
  "how to get more streams on spotify independent artist",
  "music promotion tips indie artist 2024",
  "how to grow music career without label",
  "spotify algorithm independent artist tips",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function fetchRedditPosts(subreddit, limit = 10) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}&raw_json=1`;
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error(`Reddit ${subreddit} failed: ${r.status}`);
  const d = await r.json();
  return (d?.data?.children || []).map(c => ({
    id: c.data.id,
    platform: "reddit",
    handle: `u/${c.data.author}`,
    subreddit: `r/${subreddit}`,
    title: c.data.title,
    body: c.data.selftext?.slice(0, 400) || "",
    url: `https://reddit.com${c.data.permalink}`,
    score: c.data.score,
    comments: c.data.num_comments,
  }));
}

async function fetchYouTubeComments(apiKey, query, maxResults = 8) {
  // Search for videos
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3&key=${apiKey}`;
  const sr = await fetch(searchUrl);
  if (!sr.ok) throw new Error("YouTube search failed");
  const sd = await sr.json();
  const videoIds = (sd.items || []).map(i => i.id.videoId).filter(Boolean);

  const results = [];
  for (const vid of videoIds.slice(0, 2)) {
    const cUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${vid}&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
    const cr = await fetch(cUrl);
    if (!cr.ok) continue;
    const cd = await cr.json();
    const videoTitle = sd.items.find(i => i.id.videoId === vid)?.snippet?.title || "YouTube Video";
    for (const item of (cd.items || [])) {
      const c = item.snippet.topLevelComment.snippet;
      results.push({
        id: item.id,
        platform: "youtube",
        handle: c.authorDisplayName,
        subreddit: videoTitle.slice(0, 50),
        title: c.textDisplay.slice(0, 120),
        body: c.textDisplay.slice(0, 400),
        url: `https://youtube.com/watch?v=${vid}`,
        score: c.likeCount || 0,
        comments: item.snippet.totalReplyCount || 0,
      });
    }
  }
  return results;
}

async function qualifyAndDraft(lead, masterclassUrl, masterclassHook, claudeKey) {
  const prompt = `You are an AI lead qualification agent for a music marketing expert who runs a FREE Masterclass on how independent artists can grow their streams and fanbase.

Masterclass URL: ${masterclassUrl || "[MASTERCLASS LINK]"}
Masterclass hook: ${masterclassHook || "Free class on how independent artists can grow to 100k+ streams with zero budget"}

Analyze this post/comment from an independent artist community:

Platform: ${lead.platform}
Author: ${lead.handle}
Source: ${lead.subreddit}
Title: ${lead.title}
Content: ${lead.body}

Tasks:
1. Determine HEAT level: HOT (clearly struggling with growth/promotion, expressing frustration, asking for help), WARM (interested in growth but not desperate), or COLD (not relevant — not an artist or not about growth).

2. If HOT or WARM, write a reply to post in this thread that:
- Feels like a real, helpful community member — NOT a bot or marketer
- Directly addresses their specific pain or question with a genuine insight or tip (2-3 sentences of real value FIRST)
- Then naturally mentions the free masterclass as a resource (not the main point)
- Includes the masterclass URL naturally in the text
- Ends with a soft, human CTA
- Is 80-140 words total
- Does NOT start with "Hey" or "I" — vary the opening
- Does NOT sound promotional or salesy

3. If COLD, reply with null for the reply field.

Respond ONLY with JSON:
{
  "heat": "HOT" | "WARM" | "COLD",
  "reason": "one sentence why",
  "reply": "full reply text or null"
}`;

  const r = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const d = await r.json();
  const raw = (d.content || []).map(i => i.text || "").join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy Reply" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`icon-btn ${copied ? "copied" : "gold"}`}
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      {copied ? "✓ Copied!" : label}
    </button>
  );
}

function LeadCard({ lead }) {
  const [open, setOpen] = useState(false);

  const heatClass = { HOT: "hb-hot", WARM: "hb-warm", COLD: "hb-cold" }[lead.heat] || "hb-cold";
  const platformClass = lead.platform === "reddit" ? "pb-reddit" : "pb-youtube";

  return (
    <div className="lead-card">
      <div className="lead-card-header" onClick={() => setOpen(o => !o)}>
        <div className="lead-meta">
          <div className="lead-top">
            <span className={`platform-badge ${platformClass}`}>{lead.platform}</span>
            <span className={`heat-badge ${heatClass}`}>{lead.heat}</span>
            <span className="lead-handle">{lead.handle}</span>
            <span className="lead-sub">{lead.subreddit}</span>
          </div>
          <div className="lead-snippet">{lead.title}</div>
        </div>
        <div className="lead-actions">
          {lead.reply && <CopyBtn text={lead.reply} label="Copy" />}
          <button className="icon-btn" onClick={e => { e.stopPropagation(); window.open(lead.url, "_blank"); }}>View →</button>
        </div>
      </div>

      {open && (
        <div className="lead-body">
          {lead.reply ? (
            <div className="reply-section">
              <div className="reply-label">AI-Drafted Reply</div>
              <div className="reply-text">{lead.reply}</div>
              <div className="reply-actions">
                <CopyBtn text={lead.reply} label="📋 Copy Full Reply" />
                <button className="icon-btn" onClick={() => window.open(lead.url, "_blank")}>
                  🔗 Open Thread
                </button>
              </div>
            </div>
          ) : (
            <div className="reply-section">
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: T.muted }}>
                Cold lead — no reply drafted. Not relevant to masterclass audience.
              </div>
            </div>
          )}
          <div className="original-section">
            <div className="original-label">Original Post / Comment</div>
            <div className="original-text">{lead.title} {lead.body && `— "${lead.body.slice(0, 200)}..."`}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: T.muted }}>
                Score: {lead.score} · {lead.platform === "reddit" ? `${lead.comments} comments` : `${lead.comments} replies`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [ytKey, setYtKey] = useState("");
  const [masterclassUrl, setMasterclassUrl] = useState("");
  const [masterclassHook, setMasterclassHook] = useState("");
  const [redditOn, setRedditOn] = useState(true);
  const [ytOn, setYtOn] = useState(false);
  const [selectedSubs, setSelectedSubs] = useState(["WeAreTheMusicMakers", "makinghiphop"]);
  const [postsPerSub, setPostsPerSub] = useState("8");

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [progress, setProgress] = useState([]);

  const logRef = useRef(null);

  const addLog = useCallback((msg, type = "") => {
    setLogs(l => [...l, { msg, type }]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  }, []);

  const toggleSub = (sub) => {
    setSelectedSubs(s => s.includes(sub) ? s.filter(x => x !== sub) : [...s, sub]);
  };

  const setStep = (label, status) => {
    setProgress(p => {
      const idx = p.findIndex(s => s.label === label);
      if (idx === -1) return [...p, { label, status }];
      const n = [...p]; n[idx] = { label, status }; return n;
    });
  };

  const run = async () => {
    if (!redditOn && !ytOn) { alert("Enable at least one agent."); return; }
    setRunning(true);
    setLeads([]);
    setLogs([]);
    setProgress([]);

    const rawPosts = [];

    // ── REDDIT ──
    if (redditOn) {
      setStep("Reddit Agent", "active");
      addLog("Starting Reddit agent...", "info");
      const subs = selectedSubs.length > 0 ? selectedSubs : ["WeAreTheMusicMakers"];
      for (const sub of subs) {
        try {
          addLog(`Scanning r/${sub}...`);
          const posts = await fetchRedditPosts(sub, parseInt(postsPerSub));
          rawPosts.push(...posts);
          addLog(`✓ Found ${posts.length} posts in r/${sub}`, "ok");
        } catch (e) {
          addLog(`✗ r/${sub}: ${e.message}`);
        }
      }
      setStep("Reddit Agent", "done");
    }

    // ── YOUTUBE ──
    if (ytOn && ytKey.trim()) {
      setStep("YouTube Agent", "active");
      addLog("Starting YouTube agent...", "info");
      for (const q of YT_QUERIES.slice(0, 2)) {
        try {
          addLog(`Searching: "${q.slice(0, 40)}..."`);
          const comments = await fetchYouTubeComments(ytKey, q, 6);
          rawPosts.push(...comments);
          addLog(`✓ Found ${comments.length} comments`, "ok");
        } catch (e) {
          addLog(`✗ YouTube: ${e.message}`);
        }
      }
      setStep("YouTube Agent", "done");
    } else if (ytOn && !ytKey.trim()) {
      addLog("✗ YouTube skipped — no API key provided");
    }

    addLog(`Total raw leads: ${rawPosts.length}. Running AI qualification...`, "info");
    setStep("AI Qualification", "active");

    // ── QUALIFY ──
    const qualified = [];
    const batch = rawPosts.slice(0, 20); // cap at 20 to avoid rate limits

    for (let i = 0; i < batch.length; i++) {
      const post = batch[i];
      try {
        addLog(`Qualifying ${i + 1}/${batch.length}: ${post.handle}`);
        const result = await qualifyAndDraft(post, masterclassUrl, masterclassHook);
        qualified.push({ ...post, ...result });
        if (result.heat !== "COLD") {
          addLog(`✓ ${result.heat} lead: ${post.handle}`, "ok");
        }
        setLeads([...qualified]);
      } catch (e) {
        addLog(`✗ Failed to qualify ${post.handle}`);
      }
    }

    setStep("AI Qualification", "done");
    addLog(`Done! ${qualified.filter(l => l.heat !== "COLD").length} qualified leads found.`, "info");
    setRunning(false);
  };

  const filteredLeads = leads.filter(l =>
    filter === "ALL" ? true :
    filter === "HOT+WARM" ? l.heat !== "COLD" :
    l.heat === filter
  );

  const hot = leads.filter(l => l.heat === "HOT").length;
  const warm = leads.filter(l => l.heat === "WARM").length;
  const cold = leads.filter(l => l.heat === "COLD").length;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="topbar">
          <div className="wordmark">Lead<em>Agent</em></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {redditOn && <span className="status-pill"><span className={`dot ${running ? "active" : ""}`} /> Reddit</span>}
            {ytOn && <span className="status-pill"><span className={`dot ${running ? "active" : ""}`} /> YouTube</span>}
          </div>
        </div>

        <div className="layout">
          {/* ── SIDEBAR ── */}
          <div className="sidebar">
            <div className="sidebar-section">
              <span className="sidebar-label">Active Agents</span>
              <div className="agent-toggle">
                <div className={`agent-btn ${redditOn ? "on" : ""}`} onClick={() => setRedditOn(o => !o)}>
                  🔴 Reddit
                </div>
                <div className={`agent-btn ${ytOn ? "on" : ""}`} onClick={() => setYtOn(o => !o)}>
                  ▶ YouTube
                </div>
              </div>
            </div>

            {redditOn && (
              <div className="sidebar-section">
                <span className="sidebar-label">Reddit — Subreddits</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {SUBREDDITS.map(s => (
                    <div
                      key={s}
                      className={`filter-chip ${selectedSubs.includes(s) ? "active" : ""}`}
                      style={{ fontSize: "9px", padding: "4px 10px" }}
                      onClick={() => toggleSub(s)}
                    >
                      r/{s}
                    </div>
                  ))}
                </div>
                <div className="field">
                  <span className="field-label">Posts per subreddit</span>
                  <select value={postsPerSub} onChange={e => setPostsPerSub(e.target.value)}>
                    <option value="5">5 posts</option>
                    <option value="8">8 posts</option>
                    <option value="15">15 posts</option>
                    <option value="25">25 posts</option>
                  </select>
                </div>
              </div>
            )}

            {ytOn && (
              <div className="sidebar-section">
                <span className="sidebar-label">YouTube — API Key</span>
                <div className="field">
                  <input
                    type="password"
                    placeholder="AIza..."
                    value={ytKey}
                    onChange={e => setYtKey(e.target.value)}
                  />
                </div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: T.muted, lineHeight: 1.7 }}>
                  Free. Get yours at{" "}
                  <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer">console.cloud.google.com</a>
                  {" "}→ Enable YouTube Data API v3
                </div>
              </div>
            )}

            <div className="sidebar-section">
              <span className="sidebar-label">Masterclass Details</span>
              <div className="field">
                <span className="field-label">Masterclass URL</span>
                <input
                  placeholder="https://your-link.com"
                  value={masterclassUrl}
                  onChange={e => setMasterclassUrl(e.target.value)}
                />
              </div>
              <div className="field">
                <span className="field-label">Hook / Pitch (1 line)</span>
                <textarea
                  placeholder="e.g. Free class on hitting 100k streams with zero budget"
                  value={masterclassHook}
                  onChange={e => setMasterclassHook(e.target.value)}
                  style={{ minHeight: 64 }}
                />
              </div>
            </div>

            <button className="run-btn" onClick={run} disabled={running}>
              {running ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                  Running Agents...
                </>
              ) : "⚡ Run Agents"}
            </button>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

            {progress.length > 0 && (
              <div className="progress-section">
                {progress.map(s => (
                  <div key={s.label} className={`progress-item ${s.status}`}>
                    <span className="progress-icon">
                      {s.status === "done" ? "✓" : s.status === "active" ? "▶" : "○"}
                    </span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── MAIN ── */}
          <div className="main">
            {leads.length > 0 ? (
              <>
                <div className="pipeline-header">
                  <div className="pipeline-title">Lead <span>Pipeline</span></div>
                </div>

                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-num" style={{ color: T.text }}>{leads.length}</div>
                    <div className="stat-label">Total Scanned</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num" style={{ color: T.red }}>{hot}</div>
                    <div className="stat-label">Hot Leads</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num" style={{ color: T.gold }}>{warm}</div>
                    <div className="stat-label">Warm Leads</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num" style={{ color: T.muted }}>{cold}</div>
                    <div className="stat-label">Cold / Irrelevant</div>
                  </div>
                </div>

                <div className="filter-row">
                  {["ALL", "HOT", "WARM", "HOT+WARM", "COLD"].map(f => (
                    <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                      {f === "HOT+WARM" ? "🔥 Actionable" : f}
                    </button>
                  ))}
                </div>

                {filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
              </>
            ) : running ? (
              <div className="scanning-state">
                <div className="scan-title">Agents Running</div>
                <div className="scan-sub">Scanning communities, qualifying leads, drafting replies...</div>
                <div className="scan-bars">
                  {[...Array(6)].map((_, i) => <div key={i} className="scan-bar" />)}
                </div>
                <div className="log-stream" ref={logRef}>
                  {logs.map((l, i) => (
                    <div key={i} className={`log-line ${l.type}`}>{l.msg}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="setup-card">
                  <div className="setup-title">⚡ Quick Setup — Ready in 2 Minutes</div>
                  <ul className="setup-steps">
                    <li className="setup-step"><span className="step-num">01</span><span>Enable Reddit agent (no key needed — works immediately)</span></li>
                    <li className="setup-step"><span className="step-num">02</span><span>Select the subreddits where your audience hangs out</span></li>
                    <li className="setup-step"><span className="step-num">03</span><span>Paste your masterclass URL + one-line hook</span></li>
                    <li className="setup-step"><span className="step-num">04</span><span>Hit Run Agents — AI scans posts, qualifies each lead (HOT/WARM/COLD), and drafts a personalized reply with your link embedded naturally</span></li>
                    <li className="setup-step"><span className="step-num">05</span><span>Copy each reply → paste it directly in that Reddit thread. Done.</span></li>
                  </ul>
                </div>

                <div className="empty-state">
                  <div className="empty-icon">⚡</div>
                  <div className="empty-title">No leads yet</div>
                  <div className="empty-sub">Configure your agents in the sidebar and hit Run. The pipeline will populate here in real time as leads are qualified.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
