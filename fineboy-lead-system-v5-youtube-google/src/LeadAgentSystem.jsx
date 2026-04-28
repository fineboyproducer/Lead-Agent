import { useState, useCallback, useRef } from "react";

const T = {
  bg: "#080808", surface: "#111111", card: "#161616", card2: "#1c1c1c",
  border: "#242424", border2: "#2e2e2e", gold: "#C8A84B",
  red: "#E05252", green: "#4CAF82", blue: "#5B9BD5", text: "#E8E2D6", muted: "#5A5550"
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Geist+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0} body{background:${T.bg};color:${T.text};font-family:'Lora',Georgia,serif}.app{min-height:100vh;background:${T.bg};background-image:radial-gradient(ellipse 600px 400px at 0% 0%,rgba(200,168,75,.05),transparent 70%)}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 32px;border-bottom:1px solid ${T.border};background:rgba(8,8,8,.96);position:sticky;top:0;z-index:2}.wordmark{font-family:'Syne',sans-serif;font-size:18px;font-weight:800}.wordmark em{color:${T.gold};font-style:normal}.status-pill{font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${T.muted};border:1px solid ${T.border};padding:6px 12px;border-radius:20px}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:${T.green};margin-right:6px}.layout{display:grid;grid-template-columns:310px 1fr;min-height:calc(100vh - 61px)}.sidebar{border-right:1px solid ${T.border};padding:24px 20px;background:${T.surface};display:flex;flex-direction:column;gap:22px}.sidebar-label,.field-label{display:block;font-family:'Geist Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:${T.muted};margin-bottom:8px}.agent-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px}.agent-btn{border:1px solid ${T.border2};background:${T.card};padding:13px 10px;border-radius:10px;text-align:center;font-family:'Geist Mono',monospace;font-size:12px;cursor:pointer}.agent-btn.on{border-color:${T.gold};background:rgba(200,168,75,.12);color:${T.gold}}.field{margin-bottom:14px}input,textarea,select{width:100%;background:${T.card};border:1px solid ${T.border2};color:${T.text};border-radius:10px;padding:12px;font-family:'Geist Mono',monospace;font-size:12px}textarea{min-height:76px}.hint{font-family:'Geist Mono',monospace;font-size:10px;color:${T.muted};line-height:1.7}.run-btn{border:0;border-radius:12px;background:${T.gold};color:#080808;font-family:'Syne',sans-serif;font-weight:800;padding:15px;cursor:pointer}.run-btn:disabled{opacity:.6;cursor:not-allowed}.progress-section{border-top:1px solid ${T.border};padding-top:15px}.progress-item{font-family:'Geist Mono',monospace;font-size:12px;color:${T.muted};padding:7px 0}.progress-item.done{color:${T.green}}.progress-item.active{color:${T.gold}}.main{padding:32px}.pipeline-title{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;margin-bottom:20px}.pipeline-title span{color:${T.gold}}.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}.stat-card{background:${T.card};border:1px solid ${T.border};border-radius:14px;padding:16px}.stat-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:800}.stat-label{font-family:'Geist Mono',monospace;font-size:10px;text-transform:uppercase;color:${T.muted}}.filter-row{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}.filter-chip{border:1px solid ${T.border2};background:${T.card};color:${T.text};font-family:'Geist Mono',monospace;font-size:11px;padding:8px 12px;border-radius:999px;cursor:pointer}.filter-chip.active{border-color:${T.gold};color:${T.gold};background:rgba(200,168,75,.1)}.lead-card{background:${T.card};border:1px solid ${T.border};border-radius:16px;margin-bottom:12px;overflow:hidden}.lead-card-header{display:flex;justify-content:space-between;gap:15px;padding:16px;cursor:pointer}.lead-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.platform-badge,.heat-badge{font-family:'Geist Mono',monospace;font-size:10px;text-transform:uppercase;border-radius:999px;padding:4px 8px}.pb-youtube{background:rgba(255,0,0,.12);color:#ff4444}.pb-google{background:rgba(91,155,213,.12);color:${T.blue}}.hb-hot{background:rgba(224,82,82,.15);color:${T.red}}.hb-warm{background:rgba(200,168,75,.15);color:${T.gold}}.hb-cold{background:rgba(90,85,80,.15);color:${T.muted}}.lead-handle{font-family:'Geist Mono',monospace;font-size:12px}.lead-sub{font-family:'Geist Mono',monospace;font-size:11px;color:${T.muted}}.lead-snippet{font-size:16px}.lead-actions{display:flex;gap:8px;align-items:center}.icon-btn{border:1px solid ${T.border2};background:${T.card2};color:${T.text};padding:8px 11px;border-radius:9px;cursor:pointer;font-family:'Geist Mono',monospace;font-size:11px}.icon-btn.gold,.icon-btn.copied{border-color:${T.gold};color:${T.gold}}.lead-body{border-top:1px solid ${T.border};padding:16px}.reply-section,.original-section,.setup-card,.empty-state,.scanning-state{background:${T.card};border:1px solid ${T.border};border-radius:16px;padding:22px;margin-bottom:18px}.reply-label,.original-label{font-family:'Geist Mono',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${T.gold};margin-bottom:10px}.reply-text,.original-text{line-height:1.65}.reply-actions{display:flex;gap:8px;margin-top:13px}.setup-title,.empty-title,.scan-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;margin-bottom:12px}.setup-steps{list-style:none}.setup-step{display:flex;gap:12px;margin:12px 0;line-height:1.5}.step-num{font-family:'Geist Mono',monospace;color:${T.gold}}.empty-state{text-align:center;color:${T.muted}.log-stream{max-height:280px;overflow:auto;background:#060606;border:1px solid ${T.border};border-radius:12px;padding:12px;margin-top:20px}.log-line{font-family:'Geist Mono',monospace;font-size:11px;color:${T.muted};padding:4px 0}.log-line.ok{color:${T.green}}.log-line.info{color:${T.gold}}
@media(max-width:768px){.layout{grid-template-columns:1fr}.stats-row{grid-template-columns:1fr 1fr}.lead-card-header{flex-direction:column}.sidebar{border-right:0;border-bottom:1px solid ${T.border}}}
`;

const YT_QUERIES = [
  "new afrobeat song independent artist",
  "my first music video afrobeat",
  "independent artist new song",
  "upcoming artist afrobeat 2026",
];
const GOOGLE_QUERIES = [
  '"how to promote my music" independent artist',
  '"why is my music not getting streams"',
  '"how to get spotify streams" artist',
  '"music promotion help" independent artist',
  'site:twitter.com "my song not getting streams"',
  'site:quora.com "how to promote my music"',
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchYouTubeLeads(query, maxResults = 6) {
  const r = await fetch(`/api/youtube?action=search&query=${encodeURIComponent(query)}&maxResults=${encodeURIComponent(maxResults)}`);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `YouTube failed ${r.status}`);
  return (d.items || []).map(item => {
    const vid = item.id?.videoId;
    const sn = item.snippet || {};
    return { id:`yt_${vid}`, platform:"youtube", handle:sn.channelTitle || "YouTube Channel", source:"YouTube Search", title:sn.title || "Untitled video", body:(sn.description || "").slice(0,600), url:vid ? `https://youtube.com/watch?v=${vid}` : "https://youtube.com", score:0, comments:0, query, publishedAt:sn.publishedAt || "" };
  }).filter(x => x.url);
}

async function fetchGoogleLeads(query, maxResults = 6) {
  const r = await fetch(`/api/google?query=${encodeURIComponent(query)}&maxResults=${encodeURIComponent(maxResults)}`);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Google failed ${r.status}`);
  return (d.organic_results || []).map((item, idx) => {
    let host = item.source || "Google Result";
    try { host = item.source || new URL(item.link).hostname.replace("www.", ""); } catch {}
    return { id:`g_${Date.now()}_${idx}`, platform:"google", handle:host, source:"Google Search", title:item.title || "Search result", body:(item.snippet || "").slice(0,700), url:item.link || `https://google.com/search?q=${encodeURIComponent(query)}`, score:item.position || 0, comments:0, query };
  }).filter(x => x.url);
}

function safeJsonParseClaude(raw) {
  const cleaned = String(raw || "").replace(/```json|```/g, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  throw new Error(`Claude returned non-JSON: ${cleaned.slice(0, 160)}`);
}

async function qualifyAndDraft(lead, masterclassUrl, masterclassHook) {
  const prompt = `You are an AI lead qualification agent for Fineboy Producer, a premium Afrobeat producer and music growth strategist. He sells the 100k Streams Artist Blueprint and uses a free masterclass as the front-end funnel.

Masterclass URL: ${masterclassUrl || "[not provided]"}
Hook: ${masterclassHook || "Free class on how independent artists can grow toward 100k streams with a practical rollout system"}

Analyze this lead found from YouTube or Google search:
Platform: ${lead.platform}
Lead/Profile: ${lead.handle}
Source: ${lead.source}
Query: ${lead.query}
Title: ${lead.title}
Content: ${lead.body}
URL: ${lead.url}

Tasks:
1. Determine HEAT level: HOT if they clearly show music promotion/streaming pain, WARM if they are an active artist or music creator who may need growth help, COLD if irrelevant.
2. If HOT or WARM, write a short outreach DM/comment draft for Fineboy Producer. It must feel human, specific, helpful first, then naturally invite them to the free masterclass/blueprint angle. If URL is provided, include it naturally. 60-120 words.
3. If COLD, reply with null.

Respond ONLY with JSON:
{"heat":"HOT|WARM|COLD","reason":"one sentence","reply":"text or null"}`;

  const r = await fetch("/api/claude", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:900, messages:[{role:"user", content:prompt}] }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || d.message || "Claude API failed");
  const raw = (d.content || []).map(i => i.text || "").join("");
  return safeJsonParseClaude(raw);
}

function CopyBtn({ text, label="Copy" }) {
  const [copied,setCopied]=useState(false);
  return <button className={`icon-btn ${copied ? "copied" : "gold"}`} onClick={(e)=>{e.stopPropagation();navigator.clipboard.writeText(text||"");setCopied(true);setTimeout(()=>setCopied(false),1600)}}>{copied?"✓ Copied":label}</button>;
}

function LeadCard({ lead }) {
  const [open,setOpen]=useState(false);
  const heatClass={HOT:"hb-hot",WARM:"hb-warm",COLD:"hb-cold"}[lead.heat]||"hb-cold";
  const platformClass=lead.platform==="youtube"?"pb-youtube":"pb-google";
  return <div className="lead-card">
    <div className="lead-card-header" onClick={()=>setOpen(o=>!o)}>
      <div><div className="lead-top"><span className={`platform-badge ${platformClass}`}>{lead.platform}</span><span className={`heat-badge ${heatClass}`}>{lead.heat}</span><span className="lead-handle">{lead.handle}</span><span className="lead-sub">{lead.source}</span></div><div className="lead-snippet">{lead.title}</div></div>
      <div className="lead-actions">{lead.reply&&<CopyBtn text={lead.reply}/>}<button className="icon-btn" onClick={(e)=>{e.stopPropagation();window.open(lead.url,"_blank")}}>View →</button></div>
    </div>
    {open&&<div className="lead-body">
      <div className="reply-section"><div className="reply-label">AI Drafted Outreach</div>{lead.reply?<><div className="reply-text">{lead.reply}</div><div className="reply-actions"><CopyBtn text={lead.reply} label="📋 Copy Full Draft"/><button className="icon-btn" onClick={()=>window.open(lead.url,"_blank")}>🔗 Open Lead</button></div></>:<div className="hint">Cold lead — no outreach drafted.</div>}</div>
      <div className="original-section"><div className="original-label">Original Lead Context</div><div className="original-text">{lead.title} {lead.body && `— ${lead.body.slice(0,220)}`}</div><div className="hint" style={{marginTop:8}}>Query: {lead.query}</div></div>
    </div>}
  </div>;
}

export default function LeadAgentSystem() {
  const [masterclassUrl,setMasterclassUrl]=useState("https://100k-streams.carrd.co/");
  const [masterclassHook,setMasterclassHook]=useState("Free class showing independent artists how to grow toward 100k streams with a practical rollout system");
  const [ytOn,setYtOn]=useState(true); const [googleOn,setGoogleOn]=useState(true);
  const [youtubeLimit,setYoutubeLimit]=useState("6"); const [googleLimit,setGoogleLimit]=useState("6");
  const [running,setRunning]=useState(false); const [logs,setLogs]=useState([]); const [leads,setLeads]=useState([]); const [filter,setFilter]=useState("ALL"); const [progress,setProgress]=useState([]);
  const logRef=useRef(null);
  const addLog=useCallback((msg,type="")=>{setLogs(l=>[...l,{msg,type}]);setTimeout(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight},50)},[]);
  const setStep=(label,status)=>setProgress(p=>{const i=p.findIndex(s=>s.label===label); if(i===-1)return[...p,{label,status}]; const n=[...p];n[i]={label,status};return n;});

  const run=async()=>{
    if(!ytOn&&!googleOn){alert("Enable YouTube or Google first.");return}
    setRunning(true); setLeads([]); setLogs([]); setProgress([]); const raw=[];
    if(ytOn){ setStep("YouTube Agent","active"); addLog("Starting YouTube lead source...","info"); for(const q of YT_QUERIES.slice(0,3)){ try{ addLog(`YouTube search: "${q}"`); const v=await fetchYouTubeLeads(q,parseInt(youtubeLimit)); raw.push(...v); addLog(`✓ Found ${v.length} YouTube leads`,"ok"); await sleep(450);}catch(e){addLog(`✗ YouTube: ${e.message}`)} } setStep("YouTube Agent","done"); }
    if(googleOn){ setStep("Google Agent","active"); addLog("Starting Google intent search...","info"); for(const q of GOOGLE_QUERIES.slice(0,4)){ try{ addLog(`Google search: "${q.slice(0,58)}"`); const g=await fetchGoogleLeads(q,parseInt(googleLimit)); raw.push(...g); addLog(`✓ Found ${g.length} Google leads`,"ok"); await sleep(450);}catch(e){addLog(`✗ Google: ${e.message}`)} } setStep("Google Agent","done"); }
    const deduped=Array.from(new Map(raw.map(x=>[x.url,x])).values()); addLog(`Total raw leads: ${deduped.length}. Running AI qualification...`,"info");
    if(!deduped.length){ addLog("No leads collected. Confirm YOUTUBE_API_KEY, SERPAPI_KEY, and ANTHROPIC_API_KEY are added in Vercel, then redeploy.","info"); setRunning(false); return; }
    setStep("AI Qualification","active"); const qualified=[]; const batch=deduped.slice(0,15);
    for(let i=0;i<batch.length;i++){ const lead=batch[i]; try{ addLog(`Qualifying ${i+1}/${batch.length}: ${lead.handle}`); await sleep(700); const result=await qualifyAndDraft(lead,masterclassUrl,masterclassHook); qualified.push({...lead,...result}); if(result.heat!=="COLD")addLog(`✓ ${result.heat} lead: ${lead.handle}`,"ok"); setLeads([...qualified]); }catch(e){ addLog(`✗ Failed to qualify ${lead.handle}: ${e.message}`); } }
    setStep("AI Qualification","done"); addLog(`Done! ${qualified.filter(l=>l.heat!=="COLD").length} qualified leads found.`,"info"); setRunning(false);
  };

  const filtered=leads.filter(l=>filter==="ALL"?true:filter==="HOT+WARM"?l.heat!=="COLD":l.heat===filter);
  const hot=leads.filter(l=>l.heat==="HOT").length, warm=leads.filter(l=>l.heat==="WARM").length, cold=leads.filter(l=>l.heat==="COLD").length;

  return <><style>{css}</style><div className="app"><div className="topbar"><div className="wordmark">Lead<em>Agent</em></div><div style={{display:"flex",gap:10}}>{ytOn&&<span className="status-pill"><span className="dot"/>YouTube</span>}{googleOn&&<span className="status-pill"><span className="dot"/>Google</span>}</div></div><div className="layout"><div className="sidebar">
    <div><span className="sidebar-label">Active Lead Sources</span><div className="agent-toggle"><div className={`agent-btn ${ytOn?"on":""}`} onClick={()=>setYtOn(o=>!o)}>▶ YouTube</div><div className={`agent-btn ${googleOn?"on":""}`} onClick={()=>setGoogleOn(o=>!o)}>🔎 Google</div></div></div>
    {ytOn&&<div><span className="sidebar-label">YouTube Settings</span><div className="field"><span className="field-label">Videos per query</span><select value={youtubeLimit} onChange={e=>setYoutubeLimit(e.target.value)}><option value="3">3 videos</option><option value="6">6 videos</option><option value="10">10 videos</option></select></div><div className="hint">Uses <strong>YOUTUBE_API_KEY</strong> from Vercel.</div></div>}
    {googleOn&&<div><span className="sidebar-label">Google Settings</span><div className="field"><span className="field-label">Results per query</span><select value={googleLimit} onChange={e=>setGoogleLimit(e.target.value)}><option value="4">4 results</option><option value="6">6 results</option><option value="10">10 results</option></select></div><div className="hint">Uses <strong>SERPAPI_KEY</strong> from Vercel.</div></div>}
    <div><span className="sidebar-label">Masterclass Details</span><div className="field"><span className="field-label">Masterclass URL</span><input value={masterclassUrl} onChange={e=>setMasterclassUrl(e.target.value)}/></div><div className="field"><span className="field-label">Hook / Pitch</span><textarea value={masterclassHook} onChange={e=>setMasterclassHook(e.target.value)}/></div></div>
    <button className="run-btn" onClick={run} disabled={running}>{running?"⟳ Running Sources...":"⚡ Run Lead Sources"}</button>
    {progress.length>0&&<div className="progress-section">{progress.map(s=><div key={s.label} className={`progress-item ${s.status}`}>{s.status==="done"?"✓":"▶"} {s.label}</div>)}</div>}
  </div><div className="main">{leads.length>0?<><div className="pipeline-title">Lead <span>Pipeline</span></div><div className="stats-row"><div className="stat-card"><div className="stat-num">{leads.length}</div><div className="stat-label">Scanned</div></div><div className="stat-card"><div className="stat-num" style={{color:T.red}}>{hot}</div><div className="stat-label">Hot</div></div><div className="stat-card"><div className="stat-num" style={{color:T.gold}}>{warm}</div><div className="stat-label">Warm</div></div><div className="stat-card"><div className="stat-num" style={{color:T.muted}}>{cold}</div><div className="stat-label">Cold</div></div></div><div className="filter-row">{["ALL","HOT","WARM","HOT+WARM","COLD"].map(f=><button key={f} className={`filter-chip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f==="HOT+WARM"?"🔥 Actionable":f}</button>)}</div>{filtered.map(l=><LeadCard key={l.id} lead={l}/>)}</>:running?<div className="scanning-state"><div className="scan-title">Sources Running</div><div className="hint">Scanning YouTube + Google, qualifying leads, drafting replies...</div><div className="log-stream" ref={logRef}>{logs.map((l,i)=><div key={i} className={`log-line ${l.type}`}>{l.msg}</div>)}</div></div>:<div><div className="setup-card"><div className="setup-title">⚡ Quick Setup</div><ul className="setup-steps"><li className="setup-step"><span className="step-num">01</span><span>Add ANTHROPIC_API_KEY, YOUTUBE_API_KEY, and SERPAPI_KEY in Vercel.</span></li><li className="setup-step"><span className="step-num">02</span><span>Keep YouTube + Google enabled for the first stable run.</span></li><li className="setup-step"><span className="step-num">03</span><span>Hit Run Lead Sources and review HOT/WARM leads.</span></li></ul></div><div className="empty-state"><div className="empty-title">No leads yet</div><div className="hint">Configure the sources in the sidebar and hit Run.</div></div></div>}</div></div></div></>;
}
