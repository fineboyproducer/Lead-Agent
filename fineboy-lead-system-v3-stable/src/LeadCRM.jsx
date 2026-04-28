import { useState, useEffect, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#07080A",
  surface: "#0D0F12",
  card: "#13151A",
  card2: "#191C22",
  border: "#1E2128",
  border2: "#272B35",
  gold: "#D4A843",
  goldDim: "rgba(212,168,67,0.1)",
  goldBorder: "rgba(212,168,67,0.22)",
  green: "#3DB87A",
  greenDim: "rgba(61,184,122,0.1)",
  red: "#E05555",
  redDim: "rgba(224,85,85,0.1)",
  blue: "#4B8FD4",
  blueDim: "rgba(75,143,212,0.1)",
  orange: "#E08844",
  orangeDim: "rgba(224,136,68,0.1)",
  text: "#DDD8CE",
  muted: "#525760",
  muted2: "#2A2D35",
};

const STATUS_CONFIG = {
  NEW:       { label: "New",       color: T.blue,   dim: T.blueDim,   icon: "◆" },
  REPLIED:   { label: "Replied",   color: T.gold,   dim: T.goldDim,   icon: "↗" },
  RESPONDED: { label: "Responded", color: T.orange, dim: T.orangeDim, icon: "💬" },
  CONVERTED: { label: "Converted", color: T.green,  dim: T.greenDim,  icon: "✓" },
  DEAD:      { label: "Dead",      color: T.muted,  dim: T.muted2,    icon: "×" },
};

const HEAT_CONFIG = {
  HOT:  { color: T.red,  dim: T.redDim,  label: "HOT" },
  WARM: { color: T.gold, dim: T.goldDim, label: "WARM" },
  COLD: { color: T.muted,dim: T.muted2,  label: "COLD" },
};

const PLATFORMS = ["Reddit", "YouTube", "Twitter/X", "Instagram", "TikTok", "Discord", "Other"];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STORE_KEY = "fineboy_crm_v1";

function loadLeads() {
  try {
    const raw = window.localStorage?.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLeads(leads) {
  try { window.localStorage?.setItem(STORE_KEY, JSON.stringify(leads)); } catch {}
}

function newLead(overrides = {}) {
  return {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    handle: "",
    platform: "Reddit",
    source: "",
    heat: "WARM",
    status: "NEW",
    threadUrl: "",
    draftedReply: "",
    notes: "",
    email: "",
    addedAt: Date.now(),
    activity: [],
    ...overrides,
  };
}

function addActivity(lead, action, note = "") {
  return {
    ...lead,
    activity: [
      ...(lead.activity || []),
      { action, note, ts: Date.now() }
    ]
  };
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 2px; }

body { background: ${T.bg}; color: ${T.text}; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; }

.app { min-height: 100vh; display: flex; flex-direction: column; }

/* ── TOPBAR ── */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 28px; border-bottom: 1px solid ${T.border};
  background: ${T.surface}; position: sticky; top: 0; z-index: 300;
  backdrop-filter: blur(20px);
}
.logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px; letter-spacing: 2px; color: ${T.text};
  line-height: 1;
}
.logo span { color: ${T.gold}; }

.nav-tabs { display: flex; gap: 2px; }
.nav-tab {
  padding: 8px 18px; border-radius: 3px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: ${T.muted}; cursor: pointer; border: none;
  background: transparent; transition: all 0.15s;
}
.nav-tab:hover { color: ${T.text}; }
.nav-tab.active { background: ${T.card}; color: ${T.gold}; border: 1px solid ${T.border}; }

.topbar-actions { display: flex; gap: 8px; }

/* ── BUTTONS ── */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 3px; cursor: pointer;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 1.5px; text-transform: uppercase;
  border: none; transition: all 0.15s; white-space: nowrap;
}
.btn-primary { background: ${T.gold}; color: #000; font-weight: 500; }
.btn-primary:hover { background: #e0b84e; }
.btn-ghost { background: transparent; color: ${T.muted}; border: 1px solid ${T.border}; }
.btn-ghost:hover { color: ${T.text}; border-color: ${T.border2}; }
.btn-danger { background: ${T.redDim}; color: ${T.red}; border: 1px solid rgba(224,85,85,0.2); }
.btn-danger:hover { background: rgba(224,85,85,0.2); }
.btn-success { background: ${T.greenDim}; color: ${T.green}; border: 1px solid rgba(61,184,122,0.2); }
.btn-sm { padding: 5px 10px; font-size: 9px; }

/* ── LAYOUT ── */
.main-layout { display: flex; flex: 1; min-height: 0; }
.content-area { flex: 1; overflow-y: auto; padding: 24px 28px; }

/* ── DASHBOARD ── */
.dash-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px; margin-bottom: 28px;
}
.stat-card {
  background: ${T.card}; border: 1px solid ${T.border};
  border-radius: 5px; padding: 16px 18px;
  position: relative; overflow: hidden;
}
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 3px; height: 100%;
}
.stat-card.total::before { background: ${T.border2}; }
.stat-card.new::before { background: ${T.blue}; }
.stat-card.replied::before { background: ${T.gold}; }
.stat-card.converted::before { background: ${T.green}; }
.stat-card.rate::before { background: ${T.orange}; }

.stat-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 40px; line-height: 1; margin-bottom: 4px;
}
.stat-label {
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase; color: ${T.muted};
}

/* ── FUNNEL ── */
.funnel-row {
  display: flex; gap: 2px; margin-bottom: 28px;
  background: ${T.card}; border: 1px solid ${T.border};
  border-radius: 5px; padding: 4px; overflow: hidden;
}
.funnel-step {
  flex: 1; padding: 10px 8px; border-radius: 3px;
  text-align: center; cursor: pointer; transition: all 0.15s;
}
.funnel-step:hover { opacity: 0.85; }
.funnel-step-count {
  font-family: 'Bebas Neue', sans-serif; font-size: 22px; line-height: 1;
}
.funnel-step-label {
  font-family: 'DM Mono', monospace; font-size: 8px;
  letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;
}

/* ── CONTROLS ── */
.controls-row {
  display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap;
  align-items: center;
}
.search-input {
  flex: 1; min-width: 200px;
  background: ${T.card}; border: 1px solid ${T.border};
  color: ${T.text}; padding: 8px 14px; border-radius: 3px;
  font-family: 'DM Mono', monospace; font-size: 12px; outline: none;
}
.search-input:focus { border-color: ${T.goldBorder}; }
.search-input::placeholder { color: ${T.muted}; }

select {
  background: ${T.card}; border: 1px solid ${T.border};
  color: ${T.text}; padding: 8px 12px; border-radius: 3px;
  font-family: 'DM Mono', monospace; font-size: 11px;
  outline: none; cursor: pointer; appearance: none;
}
select:focus { border-color: ${T.goldBorder}; }

/* ── TABLE ── */
.leads-table { width: 100%; border-collapse: collapse; }
.leads-table th {
  text-align: left; padding: 8px 12px;
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: ${T.muted}; border-bottom: 1px solid ${T.border};
  white-space: nowrap;
}
.leads-table td {
  padding: 12px 12px; border-bottom: 1px solid ${T.border};
  vertical-align: middle;
}
.leads-table tr:hover td { background: rgba(255,255,255,0.01); }
.leads-table tr.selected td { background: ${T.goldDim}; }

.handle-cell {
  font-family: 'DM Mono', monospace; font-size: 12px;
  color: ${T.text}; font-weight: 500;
}
.source-cell {
  font-family: 'DM Mono', monospace; font-size: 10px; color: ${T.muted};
}

/* ── BADGES ── */
.badge {
  display: inline-flex; align-items: center;
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 2px;
  white-space: nowrap;
}

/* ── STATUS SELECT ── */
.status-select {
  background: transparent; border: none; cursor: pointer;
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 1px; text-transform: uppercase;
  padding: 3px 8px; border-radius: 2px; outline: none;
  appearance: none; -webkit-appearance: none;
}

/* ── SIDE PANEL ── */
.side-panel {
  width: 380px; border-left: 1px solid ${T.border};
  background: ${T.surface}; display: flex; flex-direction: column;
  overflow-y: auto; flex-shrink: 0;
}
.panel-header {
  padding: 20px 22px 16px; border-bottom: 1px solid ${T.border};
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; background: ${T.surface}; z-index: 10;
}
.panel-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 20px;
  letter-spacing: 1px; color: ${T.text};
}
.panel-body { padding: 20px 22px; flex: 1; }
.panel-section { margin-bottom: 22px; }
.panel-label {
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: ${T.muted}; display: block; margin-bottom: 8px;
}

input[type="text"], input[type="url"], input[type="email"], textarea {
  width: 100%; background: ${T.card}; border: 1px solid ${T.border};
  color: ${T.text}; padding: 9px 12px; border-radius: 3px;
  font-family: 'DM Mono', monospace; font-size: 12px; outline: none;
  transition: border-color 0.2s;
}
input:focus, textarea:focus { border-color: ${T.goldBorder}; }
textarea { resize: vertical; min-height: 90px; line-height: 1.6; }

.panel-select {
  width: 100%; background: ${T.card}; border: 1px solid ${T.border};
  color: ${T.text}; padding: 9px 12px; border-radius: 3px;
  font-family: 'DM Mono', monospace; font-size: 12px; outline: none;
  appearance: none; cursor: pointer;
}
.panel-select:focus { border-color: ${T.goldBorder}; }

/* ── ACTIVITY LOG ── */
.activity-list { display: flex; flex-direction: column; gap: 8px; }
.activity-item {
  display: flex; gap: 10px; align-items: flex-start;
}
.activity-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: ${T.border2}; flex-shrink: 0; margin-top: 4px;
}
.activity-dot.replied { background: ${T.gold}; }
.activity-dot.converted { background: ${T.green}; }
.activity-dot.note { background: ${T.blue}; }
.activity-content { flex: 1; }
.activity-action {
  font-family: 'DM Mono', monospace; font-size: 11px; color: ${T.text};
}
.activity-ts {
  font-family: 'DM Mono', monospace; font-size: 9px; color: ${T.muted};
}
.activity-note { font-size: 12px; color: rgba(221,216,206,0.6); margin-top: 2px; }

/* ── ADD FORM ── */
.add-form { background: ${T.card}; border: 1px solid ${T.border}; border-radius: 5px; padding: 20px; margin-bottom: 20px; }
.add-form-title {
  font-family: 'Bebas Neue', sans-serif; font-size: 18px;
  letter-spacing: 1px; margin-bottom: 16px; color: ${T.gold};
}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-label {
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase; color: ${T.muted};
}
.form-actions { display: flex; gap: 8px; margin-top: 4px; }

/* ── EMPTY ── */
.empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px; text-align: center;
  color: ${T.muted};
}
.empty-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.3; }
.empty-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; margin-bottom: 6px; letter-spacing: 1px; }
.empty-sub { font-size: 12px; line-height: 1.7; max-width: 260px; font-style: italic; }

/* ── DUPLICATE WARNING ── */
.dupe-warning {
  background: ${T.redDim}; border: 1px solid rgba(224,85,85,0.25);
  border-radius: 3px; padding: 8px 12px; margin-bottom: 12px;
  font-family: 'DM Mono', monospace; font-size: 10px; color: ${T.red};
  display: flex; align-items: center; gap: 8px;
}

/* ── REPLY PREVIEW ── */
.reply-preview {
  background: #0A0C0F; border: 1px solid ${T.border};
  border-radius: 3px; padding: 14px;
  font-size: 12px; line-height: 1.8; color: rgba(221,216,206,0.7);
  white-space: pre-wrap; margin-bottom: 10px; max-height: 200px; overflow-y: auto;
}
.reply-highlight { color: ${T.gold}; font-weight: bold; }

/* ── PANEL TABS ── */
.panel-tabs { display: flex; border-bottom: 1px solid ${T.border}; }
.panel-tab {
  flex: 1; padding: 10px; text-align: center;
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: 1.5px; text-transform: uppercase;
  color: ${T.muted}; cursor: pointer; border: none;
  background: transparent; border-bottom: 2px solid transparent;
  margin-bottom: -1px; transition: all 0.15s;
}
.panel-tab:hover { color: ${T.text}; }
.panel-tab.active { color: ${T.gold}; border-bottom-color: ${T.gold}; }

/* ── TOOLTIP ── */
.row-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
tr:hover .row-actions { opacity: 1; }

@keyframes slideIn {
  from { transform: translateX(20px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
.side-panel { animation: slideIn 0.2s ease; }

@media (max-width: 900px) {
  .dash-grid { grid-template-columns: repeat(3, 1fr); }
  .side-panel { width: 100%; border-left: none; border-top: 1px solid ${T.border}; }
  .main-layout { flex-direction: column; }
}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function exportCSV(leads) {
  const cols = ["handle", "platform", "source", "heat", "status", "threadUrl", "email", "notes", "addedAt"];
  const rows = leads.map(l => cols.map(c => `"${(l[c] || "").toString().replace(/"/g, '""')}"`).join(","));
  const csv = [cols.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `leads_${Date.now()}.csv`; a.click();
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, onChange }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NEW;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", borderRadius: 2, overflow: "hidden" }}>
      <select
        className="status-select badge"
        value={status}
        onChange={e => onChange(e.target.value)}
        style={{ background: cfg.dim, color: cfg.color, border: `1px solid ${cfg.color}22` }}
      >
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <option key={k} value={k} style={{ background: T.card, color: v.color }}>{v.icon} {v.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── HEAT BADGE ───────────────────────────────────────────────────────────────
function HeatBadge({ heat }) {
  const cfg = HEAT_CONFIG[heat] || HEAT_CONFIG.COLD;
  return (
    <span className="badge" style={{ background: cfg.dim, color: cfg.color, border: `1px solid ${cfg.color}22` }}>
      {cfg.label}
    </span>
  );
}

// ─── PLATFORM BADGE ───────────────────────────────────────────────────────────
function PlatformBadge({ platform }) {
  const colors = {
    Reddit: "#FF5722", YouTube: "#FF0000", "Twitter/X": "#1DA1F2",
    Instagram: "#C13584", TikTok: "#69C9D0", Discord: "#5865F2", Other: T.muted,
  };
  const c = colors[platform] || T.muted;
  return (
    <span className="badge" style={{ background: `${c}18`, color: c, border: `1px solid ${c}25` }}>
      {platform}
    </span>
  );
}

// ─── ADD LEAD FORM ────────────────────────────────────────────────────────────
function AddLeadForm({ leads, onAdd, onClose }) {
  const [form, setForm] = useState({ handle: "", platform: "Reddit", source: "", heat: "WARM", threadUrl: "", draftedReply: "", notes: "", email: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const dupe = leads.find(l => l.handle.toLowerCase() === form.handle.toLowerCase() && form.handle.length > 1);

  const submit = () => {
    if (!form.handle.trim()) return;
    onAdd(newLead({ ...form, activity: [{ action: "Lead added", note: "", ts: Date.now() }] }));
    onClose();
  };

  return (
    <div className="add-form">
      <div className="add-form-title">+ Add New Lead</div>

      {dupe && (
        <div className="dupe-warning">
          ⚠ Already have <strong style={{ margin: "0 4px" }}>{form.handle}</strong> in CRM — status: {dupe.status}
        </div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <span className="form-label">Handle / Name *</span>
          <input type="text" placeholder="u/artistname or @handle" value={form.handle} onChange={e => set("handle", e.target.value)} />
        </div>
        <div className="form-field">
          <span className="form-label">Platform</span>
          <select className="panel-select" value={form.platform} onChange={e => set("platform", e.target.value)}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-field">
          <span className="form-label">Source (subreddit, etc.)</span>
          <input type="text" placeholder="r/makinghiphop" value={form.source} onChange={e => set("source", e.target.value)} />
        </div>
        <div className="form-field">
          <span className="form-label">Heat Level</span>
          <select className="panel-select" value={form.heat} onChange={e => set("heat", e.target.value)}>
            {Object.keys(HEAT_CONFIG).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div className="form-field" style={{ marginBottom: 10 }}>
        <span className="form-label">Thread / Post URL</span>
        <input type="url" placeholder="https://reddit.com/r/..." value={form.threadUrl} onChange={e => set("threadUrl", e.target.value)} />
      </div>
      <div className="form-field" style={{ marginBottom: 10 }}>
        <span className="form-label">Email (if captured)</span>
        <input type="email" placeholder="artist@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
      </div>
      <div className="form-field" style={{ marginBottom: 10 }}>
        <span className="form-label">Drafted Reply</span>
        <textarea placeholder="Paste the AI-drafted reply here..." value={form.draftedReply} onChange={e => set("draftedReply", e.target.value)} style={{ minHeight: 70 }} />
      </div>
      <div className="form-field" style={{ marginBottom: 14 }}>
        <span className="form-label">Notes</span>
        <textarea placeholder="Any context about this lead..." value={form.notes} onChange={e => set("notes", e.target.value)} style={{ minHeight: 50 }} />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={submit}>Save Lead</button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── SIDE PANEL ───────────────────────────────────────────────────────────────
function LeadPanel({ lead, onUpdate, onDelete, onClose }) {
  const [tab, setTab] = useState("details");
  const [noteInput, setNoteInput] = useState("");
  const [editing, setEditing] = useState({});

  const set = (k, v) => onUpdate({ ...lead, [k]: v });
  const ed = (k, v) => setEditing(e => ({ ...e, [k]: v }));

  const markReplied = () => {
    onUpdate(addActivity({ ...lead, status: "REPLIED" }, "Replied", noteInput || "Reply sent"));
    setNoteInput("");
  };
  const addNote = () => {
    if (!noteInput.trim()) return;
    onUpdate(addActivity(lead, "Note added", noteInput));
    setNoteInput("");
  };
  const changeStatus = (s) => {
    onUpdate(addActivity({ ...lead, status: s }, `Status → ${s}`));
  };

  const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;

  return (
    <div className="side-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">{lead.handle}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <PlatformBadge platform={lead.platform} />
            <HeatBadge heat={lead.heat} />
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>

      <div className="panel-tabs">
        {["details", "reply", "activity"].map(t => (
          <button key={t} className={`panel-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="panel-body">
        {tab === "details" && (
          <>
            <div className="panel-section">
              <span className="panel-label">Status</span>
              <StatusBadge status={lead.status} onChange={changeStatus} />
            </div>

            <div className="panel-section">
              <span className="panel-label">Source</span>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: T.muted }}>{lead.source || "—"}</div>
            </div>

            {lead.threadUrl && (
              <div className="panel-section">
                <span className="panel-label">Thread</span>
                <a href={lead.threadUrl} target="_blank" rel="noreferrer"
                  style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, wordBreak: "break-all" }}>
                  {lead.threadUrl.slice(0, 55)}…
                </a>
              </div>
            )}

            <div className="panel-section">
              <span className="panel-label">Email</span>
              <input type="email" value={lead.email || ""} onChange={e => set("email", e.target.value)} placeholder="Not captured yet" />
            </div>

            <div className="panel-section">
              <span className="panel-label">Notes</span>
              <textarea value={lead.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Add notes about this lead..." style={{ minHeight: 80 }} />
            </div>

            <div className="panel-section">
              <span className="panel-label">Heat</span>
              <select className="panel-select" value={lead.heat} onChange={e => set("heat", e.target.value)}>
                {Object.keys(HEAT_CONFIG).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-success btn-sm" onClick={() => changeStatus("CONVERTED")}>✓ Mark Converted</button>
              <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm("Delete this lead?")) { onDelete(lead.id); onClose(); } }}>Delete</button>
            </div>

            <div style={{ marginTop: 12, fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.muted }}>
              Added {fmt(lead.addedAt)}
            </div>
          </>
        )}

        {tab === "reply" && (
          <>
            <div className="panel-section">
              <span className="panel-label">Drafted Reply</span>
              {lead.draftedReply ? (
                <>
                  <div className="reply-preview">{lead.draftedReply}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard.writeText(lead.draftedReply); }}>📋 Copy Reply</button>
                    {lead.threadUrl && <a href={lead.threadUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open Thread →</a>}
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted, fontStyle: "italic" }}>No reply drafted yet.</div>
              )}
            </div>

            <div className="panel-section">
              <span className="panel-label">Edit Reply</span>
              <textarea value={lead.draftedReply || ""} onChange={e => set("draftedReply", e.target.value)} style={{ minHeight: 120 }} placeholder="Paste or edit your reply..." />
            </div>

            <div className="panel-section">
              <span className="panel-label">Log Action</span>
              <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Optional note (e.g. 'they responded, interested')" style={{ minHeight: 60 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={markReplied}>✓ Mark as Replied</button>
                <button className="btn btn-ghost btn-sm" onClick={addNote}>+ Add Note</button>
              </div>
            </div>
          </>
        )}

        {tab === "activity" && (
          <div className="panel-section">
            <span className="panel-label">Activity Log</span>
            {(lead.activity || []).length === 0 ? (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted }}>No activity yet.</div>
            ) : (
              <div className="activity-list">
                {[...(lead.activity || [])].reverse().map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className={`activity-dot ${a.action.toLowerCase().includes("replied") ? "replied" : a.action.toLowerCase().includes("converted") ? "converted" : "note"}`} />
                    <div className="activity-content">
                      <div className="activity-action">{a.action}</div>
                      <div className="activity-ts">{fmt(a.ts)}</div>
                      {a.note && <div className="activity-note">{a.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [leads, setLeads] = useState(() => loadLeads());
  const [view, setView] = useState("pipeline");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterHeat, setFilterHeat] = useState("ALL");
  const [filterPlatform, setFilterPlatform] = useState("ALL");
  const [sortBy, setSortBy] = useState("addedAt");

  useEffect(() => { saveLeads(leads); }, [leads]);

  const upsert = useCallback((lead) => {
    setLeads(ls => {
      const idx = ls.findIndex(l => l.id === lead.id);
      if (idx === -1) return [lead, ...ls];
      const n = [...ls]; n[idx] = lead; return n;
    });
    setSelected(lead);
  }, []);

  const deleteLead = useCallback((id) => {
    setLeads(ls => ls.filter(l => l.id !== id));
    setSelected(null);
  }, []);

  // ── STATS ──
  const total = leads.length;
  const byStatus = (s) => leads.filter(l => l.status === s).length;
  const converted = byStatus("CONVERTED");
  const replied = leads.filter(l => ["REPLIED","RESPONDED","CONVERTED"].includes(l.status)).length;
  const convRate = replied > 0 ? Math.round((converted / replied) * 100) : 0;

  // ── FILTER / SORT ──
  const filtered = leads
    .filter(l => {
      if (filterStatus !== "ALL" && l.status !== filterStatus) return false;
      if (filterHeat !== "ALL" && l.heat !== filterHeat) return false;
      if (filterPlatform !== "ALL" && l.platform !== filterPlatform) return false;
      if (search) {
        const q = search.toLowerCase();
        return l.handle.toLowerCase().includes(q) || l.source?.toLowerCase().includes(q) || l.notes?.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "addedAt") return b.addedAt - a.addedAt;
      if (sortBy === "heat") return ["HOT","WARM","COLD"].indexOf(a.heat) - ["HOT","WARM","COLD"].indexOf(b.heat);
      if (sortBy === "status") return Object.keys(STATUS_CONFIG).indexOf(a.status) - Object.keys(STATUS_CONFIG).indexOf(b.status);
      return 0;
    });

  const selectedLead = selected ? leads.find(l => l.id === selected.id) : null;

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="logo">Fine<span>Boy</span> CRM</div>
          <div className="nav-tabs">
            <button className={`nav-tab ${view === "pipeline" ? "active" : ""}`} onClick={() => setView("pipeline")}>Pipeline</button>
            <button className={`nav-tab ${view === "dashboard" ? "active" : ""}`} onClick={() => setView("dashboard")}>Dashboard</button>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(leads)}>↓ Export CSV</button>
            <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(true); setSelected(null); }}>+ Add Lead</button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="main-layout">
          <div className="content-area">

            {/* ── DASHBOARD ── */}
            {view === "dashboard" && (
              <>
                <div className="dash-grid">
                  <div className="stat-card total">
                    <div className="stat-num" style={{ color: T.text }}>{total}</div>
                    <div className="stat-label">Total Leads</div>
                  </div>
                  <div className="stat-card new">
                    <div className="stat-num" style={{ color: T.blue }}>{byStatus("NEW")}</div>
                    <div className="stat-label">New</div>
                  </div>
                  <div className="stat-card replied">
                    <div className="stat-num" style={{ color: T.gold }}>{replied}</div>
                    <div className="stat-label">Contacted</div>
                  </div>
                  <div className="stat-card converted">
                    <div className="stat-num" style={{ color: T.green }}>{converted}</div>
                    <div className="stat-label">Converted</div>
                  </div>
                  <div className="stat-card rate">
                    <div className="stat-num" style={{ color: T.orange }}>{convRate}%</div>
                    <div className="stat-label">Conv. Rate</div>
                  </div>
                </div>

                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.muted, marginBottom: 10 }}>
                  Conversion Funnel
                </div>
                <div className="funnel-row">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => {
                    const count = byStatus(k);
                    return (
                      <div key={k} className="funnel-step"
                        style={{ background: `${v.color}14`, cursor: "pointer" }}
                        onClick={() => { setView("pipeline"); setFilterStatus(k); }}>
                        <div className="funnel-step-count" style={{ color: v.color }}>{count}</div>
                        <div className="funnel-step-label" style={{ color: v.color }}>{v.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.muted, marginBottom: 10 }}>
                  By Platform
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
                  {PLATFORMS.map(p => {
                    const n = leads.filter(l => l.platform === p).length;
                    if (!n) return null;
                    return (
                      <div key={p} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, padding: "12px 16px", minWidth: 100 }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: T.text }}>{n}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.muted, letterSpacing: 1, textTransform: "uppercase" }}>{p}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: T.muted, marginBottom: 10 }}>
                  Recent Activity
                </div>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 5, overflow: "hidden" }}>
                  {leads
                    .flatMap(l => (l.activity || []).map(a => ({ ...a, handle: l.handle, id: l.id })))
                    .sort((a, b) => b.ts - a.ts)
                    .slice(0, 8)
                    .map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted, minWidth: 70 }}>{fmt(a.ts)}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.gold, minWidth: 100 }}>{a.handle}</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.text }}>{a.action}</div>
                        {a.note && <div style={{ fontSize: 12, color: T.muted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.note}</div>}
                      </div>
                    ))
                  }
                  {leads.flatMap(l => l.activity || []).length === 0 && (
                    <div style={{ padding: "20px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: T.muted }}>No activity yet. Start adding leads.</div>
                  )}
                </div>
              </>
            )}

            {/* ── PIPELINE ── */}
            {view === "pipeline" && (
              <>
                {showAdd && <AddLeadForm leads={leads} onAdd={upsert} onClose={() => setShowAdd(false)} />}

                <div className="controls-row">
                  <input className="search-input" placeholder="Search handles, sources, notes..." value={search} onChange={e => setSearch(e.target.value)} />
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="ALL">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={filterHeat} onChange={e => setFilterHeat(e.target.value)}>
                    <option value="ALL">All Heat</option>
                    {Object.keys(HEAT_CONFIG).map(k => <option key={k}>{k}</option>)}
                  </select>
                  <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
                    <option value="ALL">All Platforms</option>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="addedAt">Newest First</option>
                    <option value="heat">By Heat</option>
                    <option value="status">By Status</option>
                  </select>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.muted, whiteSpace: "nowrap" }}>
                    {filtered.length} leads
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">◆</div>
                    <div className="empty-title">{leads.length === 0 ? "No Leads Yet" : "No Matches"}</div>
                    <div className="empty-sub">
                      {leads.length === 0
                        ? "Add your first lead manually or run the LeadAgent to populate your pipeline."
                        : "Try adjusting your filters or search term."}
                    </div>
                  </div>
                ) : (
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th>Handle</th>
                        <th>Platform</th>
                        <th>Source</th>
                        <th>Heat</th>
                        <th>Status</th>
                        <th>Added</th>
                        <th>Last Activity</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(lead => {
                        const lastAct = (lead.activity || []).slice(-1)[0];
                        const isSelected = selectedLead?.id === lead.id;
                        return (
                          <tr key={lead.id} className={isSelected ? "selected" : ""} onClick={() => { setSelected(lead); setShowAdd(false); }} style={{ cursor: "pointer" }}>
                            <td>
                              <div className="handle-cell">{lead.handle}</div>
                              {lead.email && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.muted }}>{lead.email}</div>}
                            </td>
                            <td><PlatformBadge platform={lead.platform} /></td>
                            <td><div className="source-cell">{lead.source || "—"}</div></td>
                            <td><HeatBadge heat={lead.heat} /></td>
                            <td>
                              <StatusBadge status={lead.status} onChange={s => {
                                const updated = addActivity({ ...lead, status: s }, `Status → ${s}`);
                                upsert(updated);
                              }} />
                            </td>
                            <td><div className="source-cell">{fmt(lead.addedAt)}</div></td>
                            <td>
                              {lastAct ? (
                                <div>
                                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: T.text }}>{lastAct.action}</div>
                                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: T.muted }}>{fmt(lastAct.ts)}</div>
                                </div>
                              ) : <span style={{ color: T.muted, fontSize: 12 }}>—</span>}
                            </td>
                            <td>
                              <div className="row-actions">
                                {lead.threadUrl && (
                                  <a href={lead.threadUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>→</a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>

          {/* ── SIDE PANEL ── */}
          {selectedLead && (
            <LeadPanel
              lead={selectedLead}
              onUpdate={upsert}
              onDelete={deleteLead}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}
