import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import LeadAgentSystem from "./LeadAgentSystem.jsx";
import LeadCRM from "./LeadCRM.jsx";

function AppShell() {
  const [app, setApp] = useState("agent");
  return (
    <>
      <div style={{position:"fixed", right:14, bottom:14, zIndex:9999, display:"flex", gap:8}}>
        <button onClick={() => setApp("agent")} style={btn(app === "agent")}>Lead Agent</button>
        <button onClick={() => setApp("crm")} style={btn(app === "crm")}>CRM</button>
      </div>
      {app === "agent" ? <LeadAgentSystem /> : <LeadCRM />}
    </>
  );
}
function btn(active){return {padding:"10px 14px",borderRadius:6,border:"1px solid #333",background:active?"#D4A843":"#111",color:active?"#000":"#DDD8CE",fontFamily:"monospace",cursor:"pointer"}}

createRoot(document.getElementById("root")).render(<AppShell />);
