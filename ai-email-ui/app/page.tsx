// "use client";
// import React, { useState, useRef } from "react";
// import {
//   Terminal,
//   Send,
//   UploadCloud,
//   Cpu,
//   Database,
//   XCircle,
//   ChevronRight,
// } from "lucide-react";
// import Papa from "papaparse";

// interface Lead {
//   Name: string;
//   Email: string;
// }

// export default function Dashboard() {
//   const [subject, setSubject] = useState("");
//   const [body, setBody] = useState("");
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [status, setStatus] = useState("SYSTEM IDLE");
//   const [logs, setLogs] = useState<string[]>([
//     "[SYS]: OS Initialized.",
//     "[SYS]: Ready for mission parameters.",
//   ]);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const addLog = (msg: string) => {
//     setLogs((prev) =>
//       [`[${new Date().toLocaleTimeString()}]: ${msg}`, ...prev].slice(0, 5),
//     );
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setStatus("PARSING TARGET DATA...");
//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         const parsedData = results.data as Lead[];
//         setLeads(parsedData);
//         setStatus(`DATA LOADED: ${parsedData.length} TARGETS`);
//         addLog(`Database updated. ${parsedData.length} records synchronized.`);
//       },
//     });
//   };

//   const handleFireCampaign = async () => {
//     setStatus("LAUNCHING...");
//     addLog("Initiating SMTP Handshake...");

//     try {
//       const response = await fetch("http://localhost:3001/api/start-campaign", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ subject, body, leads }),
//       });

//       if (response.ok) {
//         setStatus("CAMPAIGN ACTIVE");
//         addLog("Mission Live. Check Backend terminal for logs.");
//       } else {
//         setStatus("ERROR: REJECTED");
//         addLog("Critical: Server rejected payload.");
//       }
//     } catch (error) {
//       setStatus("OFFLINE");
//       addLog("Critical: Backend uplink failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-zinc-950 text-cyan-400 font-mono p-8 selection:bg-cyan-900">
//       <input
//         type="file"
//         accept=".csv"
//         ref={fileInputRef}
//         onChange={handleFileUpload}
//         className="hidden"
//       />

//       {/* HEADER */}
//       <header className="flex items-center justify-between border-b border-cyan-900/30 pb-6 mb-8">
//         <div className="flex items-center gap-3">
//           <Cpu className="w-8 h-8 animate-pulse text-cyan-500" />
//           <h1 className="text-2xl font-bold tracking-[0.2em] drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
//             NEXUS // DISPATCH
//           </h1>
//         </div>
//         <div className="flex items-center gap-3 text-xs bg-cyan-950/20 border border-cyan-800/40 px-4 py-2 rounded">
//           <span
//             className={`w-2 h-2 rounded-full ${status.includes("ERROR") ? "bg-red-500" : "bg-cyan-500 animate-ping"}`}
//           ></span>
//           {status}
//         </div>
//       </header>

//       <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* LEFT COLUMN: INPUTS */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-zinc-900/40 border border-cyan-900/30 p-5 rounded-lg backdrop-blur-sm">
//             <label className="text-[10px] text-cyan-700 uppercase tracking-[0.3em] mb-4 block">
//               01. Subject_Line
//             </label>
//             <input
//               className="w-full bg-transparent border-b border-cyan-900/50 py-2 focus:outline-none focus:border-cyan-400 text-white transition-all"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               placeholder="Mission Title..."
//             />
//           </div>

//           <div className="bg-zinc-900/40 border border-cyan-900/30 p-5 rounded-lg backdrop-blur-sm">
//             <label className="text-[10px] text-cyan-700 uppercase tracking-[0.3em] mb-4 block">
//               02. Payload_Body
//             </label>
//             <textarea
//               rows={6}
//               className="w-full bg-transparent border border-cyan-900/30 rounded p-4 focus:outline-none focus:border-cyan-500 text-zinc-300 resize-none"
//               value={body}
//               onChange={(e) => setBody(e.target.value)}
//               placeholder="Input your message coordinates..."
//             />
//           </div>

//           {/* ACTION BUTTONS */}
//           <div className="grid grid-cols-2 gap-4 pt-4">
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="flex items-center justify-center gap-2 border border-cyan-800 bg-cyan-950/10 py-4 rounded hover:bg-cyan-900/20 transition-all group"
//             >
//               <UploadCloud className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
//               {leads.length > 0
//                 ? `REPLACE CSV (${leads.length})`
//                 : "LOAD TARGETS (.CSV)"}
//             </button>
//             <button
//               onClick={handleFireCampaign}
//               disabled={!leads.length || !subject}
//               className="bg-cyan-500 text-black font-black uppercase tracking-widest rounded hover:bg-cyan-400 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
//             >
//               EXECUTE MISSION
//             </button>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: PREVIEW & LOGS */}
//         <div className="space-y-6">
//           {/* DATA PREVIEW */}
//           <div className="bg-black/60 border border-cyan-900/30 rounded-lg p-5 h-[300px] flex flex-col">
//             <label className="text-[10px] text-cyan-700 uppercase tracking-[0.3em] mb-4 flex justify-between">
//               <span>03. Data_Stream</span>
//               {leads.length > 0 && (
//                 <button onClick={() => setLeads([])}>
//                   <XCircle className="w-3 h-3 hover:text-red-500" />
//                 </button>
//               )}
//             </label>

//             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
//               {leads.length > 0 ? (
//                 leads.slice(0, 10).map((lead, i) => (
//                   <div
//                     key={i}
//                     className="text-[11px] border-l border-cyan-800 pl-3 py-1 bg-cyan-950/5 flex justify-between group"
//                   >
//                     <span className="text-zinc-400 group-hover:text-cyan-300 transition-colors">
//                       {lead.Name}
//                     </span>
//                     <span className="text-cyan-900 italic">
//                       {lead.Email.split("@")[0]}...
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <div className="h-full flex flex-col items-center justify-center text-cyan-900 opacity-30 text-center">
//                   <Database className="w-8 h-8 mb-2" />
//                   <p className="text-[10px]">AWAITING DATA INPUT</p>
//                 </div>
//               )}
//               {leads.length > 10 && (
//                 <p className="text-[9px] text-cyan-900 text-center pt-2">
//                   +{leads.length - 10} more records in buffer
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* TERMINAL LOGS */}
//           <div className="bg-black border border-cyan-900/50 p-4 rounded h-[180px] font-mono text-[10px]">
//             <div className="flex items-center gap-2 mb-3 text-cyan-800 border-b border-cyan-900/30 pb-2">
//               <Terminal className="w-3 h-3" /> [LOG_STREAM]
//             </div>
//             <div className="space-y-1">
//               {logs.map((log, i) => (
//                 <div key={i} className="flex gap-2">
//                   <ChevronRight className="w-3 h-3 shrink-0 text-cyan-700" />
//                   <span className={i === 0 ? "text-cyan-300" : "text-cyan-900"}>
//                     {log}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Terminal,
  Send,
  UploadCloud,
  Cpu,
  Database,
  Mail,
  Type,
  Activity,
  ChevronRight,
  Settings,
} from "lucide-react";
import Papa from "papaparse";

interface Lead {
  Name: string;
  Email: string;
}

export default function Dashboard() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState("READY_FOR_DEPLOYMENT");
  const [font, setFont] = useState("font-mono"); // Options: font-mono, font-sans, font-serif
  const [logs, setLogs] = useState<string[]>([
    "[SYS]: NEXUS Engine Online.",
    "[SYS]: Awaiting mission files...",
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background Particles (Embers)
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 4 + 1}px`,
        duration: `${8 + Math.random() * 10}s`,
        delay: `${Math.random() * 5}s`,
        color: Math.random() > 0.3 ? "#f97316" : "#ea580c", // Orange to Dark Red
      })),
    );
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) =>
      [`[${new Date().toLocaleTimeString()}]: ${msg}`, ...prev].slice(0, 5),
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setLeads(res.data as Lead[]);
        setStatus("TARGETS_LOCKED");
        addLog(`Synchronized ${res.data.length} recipients successfully.`);
      },
    });
  };

  const handleFireCampaign = async () => {
    // Basic validation
    if (!leads.length || !subject || !body) {
      setStatus("ERROR: PARAMS_MISSING");
      addLog("Critical: Missing subject, body, or target data.");
      return;
    }

    setStatus("FIRING_PHASERS...");
    addLog("Initiating SMTP Handshake via Nexus Backend...");

    try {
      // Connecting to your Node.js server on port 3001
      const response = await fetch("http://localhost:3001/api/start-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject,
          body: body,
          leads: leads,
        }),
      });

      if (response.ok) {
        setStatus("MISSION_LIVE");
        addLog("Success: Mission payload deployed successfully.");
        // Optional: clear inputs after success
        setSubject("");
        setBody("");
      } else {
        const errorData = await response.json();
        setStatus("ERROR: UPLINK_REJECTED");
        addLog(`Server Error: ${errorData.error || "Unknown rejection"}`);
      }
    } catch (error) {
      setStatus("UPLINK_CRITICAL");
      addLog("Critical: MotherShip is offline. Check backend terminal.");
      console.error("Transmission Error:", error);
    }
  };

  return (
    <div
      className={`relative min-h-screen ${font} text-cyan-400 p-6 selection:bg-orange-950`}
    >
      <div className="bg-universe" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="ember shadow-[0_0_10px_#f97316]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* HEADER SECTION */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-orange-600/10 border border-orange-500/30 rounded shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <Cpu className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-glow">
              NEXUS DISPATCH
            </h1>
            <p className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase font-bold">
              Autonomous Marketing Ops
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* FONT SELECTOR */}
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setFont("font-mono")}
              className={`p-2 rounded ${font === "font-mono" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-600"}`}
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFont("font-sans")}
              className={`p-2 rounded ${font === "font-sans" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-600"}`}
            >
              <Type className="w-4 h-4 italic" />
            </button>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <div className="bg-cyan-500/5 border border-cyan-500/20 px-4 py-2 rounded-full flex items-center gap-3">
            <Activity className="w-3 h-3 text-cyan-500 animate-ping" />
            <span className="text-[10px] font-bold tracking-widest">
              {status}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* CENTER COLUMN: COMPOSE (GMAIL STYLE) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

            <div className="flex items-center gap-3 mb-8">
              <Mail className="w-5 h-5 text-zinc-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                Mission Composition
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-cyan-700 font-bold mb-2 block">
                  Subject
                </label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-zinc-800"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Type mission subject..."
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-cyan-700 font-bold mb-2 block">
                  Body Content
                </label>
                <textarea
                  rows={10}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-zinc-300 focus:outline-none focus:border-cyan-500/50 resize-none transition-all"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Hi {{Name}}, input your strategic content here..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 bg-zinc-900/50 border border-white/10 py-5 rounded-xl hover:border-cyan-500/40 transition-all group"
            >
              <UploadCloud className="w-5 h-5 text-cyan-500 group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">
                {leads.length > 0
                  ? `${leads.length} Targets Loaded`
                  : "Load CSV Database"}
              </span>
            </button>

            <button
              onClick={handleFireCampaign} // <-- Ye line miss ho gayi thi, isko add karo
              disabled={!leads.length || !subject}
              className="neon-btn-orange bg-orange-600 text-white font-black py-5 rounded-xl uppercase tracking-[0.4em] flex items-center justify-center gap-3 disabled:opacity-20"
            >
              Execute Mission <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DATA HUD */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* DATA STREAM (Fixed to show Emails) */}
          <div className="glass-panel rounded-2xl p-6 h-[400px] flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-800 mb-6 border-b border-white/5 pb-4 flex justify-between items-center">
              Target Data Stream <Settings className="w-3 h-3" />
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {leads.length > 0 ? (
                leads.map((l, i) => (
                  <div
                    key={i}
                    className="bg-white/5 p-3 rounded border border-transparent hover:border-cyan-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-white group-hover:text-cyan-400">
                        {l.Name}
                      </span>
                      <span className="text-[8px] text-zinc-600">
                        ID:0{i + 1}
                      </span>
                    </div>
                    <div className="text-[9px] text-zinc-500 italic truncate">
                      {l.Email}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
                  <Database className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase">No Uplink Detected</p>
                </div>
              )}
            </div>
          </div>

          {/* SYSTEM LOGS */}
          <div className="glass-panel p-5 rounded-2xl h-[240px] border-l-2 border-l-cyan-500">
            <div className="flex items-center gap-2 mb-4 text-cyan-700 text-[9px] font-black tracking-widest uppercase">
              <Terminal className="w-3 h-3" /> Realtime Output
            </div>
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-[10px] leading-tight">
                  <ChevronRight className="w-3 h-3 shrink-0 text-cyan-800" />
                  <span className={i === 0 ? "text-cyan-400" : "text-zinc-700"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}