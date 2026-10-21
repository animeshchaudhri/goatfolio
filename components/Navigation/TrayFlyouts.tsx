"use client";
import React, { useEffect, useState } from "react";
import { ICONS } from "./icons";
import { iconPath } from "../Desktop/apps";

// Win7 notification-area flyouts. All sit at the bottom-right corner above the taskbar.

export const FLYOUT_STYLES = `
  .w7fly {
    position: absolute; right: 6px; bottom: 46px; z-index: 3; box-sizing: border-box; padding: 3px; border-radius: 6px;
    max-width: calc(100vw - 12px);
    background-color: rgba(26, 58, 96, 0.55);
    background-image: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.1));
    -webkit-backdrop-filter: blur(9px) saturate(1.4); backdrop-filter: blur(9px) saturate(1.4);
    border: 1px solid rgba(0,0,0,0.75); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.32), 0 0 10px rgba(0,0,0,0.45);
    font-family: "Segoe UI", Tahoma, sans-serif; font-size: 12px; color: #1e1e1e; user-select: none; -webkit-user-select: none;
  }
  .w7fly-body { background: #fff; border: 1px solid rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden; }
  .w7fly-foot {
    display: flex; align-items: center; justify-content: center; gap: 14px; min-height: 30px; padding: 0 10px;
    background: linear-gradient(180deg, #f1f5fb 0%, #e3ebf5 100%); border-top: 1px solid #ccd9ea;
  }
  .w7-link { all: unset; color: #0066cc; cursor: pointer; white-space: nowrap; }
  .w7-link:hover { color: #3399ff; text-decoration: underline; }
  .w7fly-hdr { display: flex; align-items: center; gap: 6px; color: #1e395b; padding: 6px 10px 2px; white-space: nowrap; }
  .w7fly-hdr::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; }
  .w7fly-row { display: flex; align-items: center; gap: 8px; margin: 1px 4px; padding: 4px 6px; border: 1px solid transparent; border-radius: 3px; cursor: default; }
  .w7fly-row:hover, .w7fly-row.is-open { background: linear-gradient(180deg, #f3f8fd 0%, #dceafb 100%); border-color: #7da2ce; }
  .w7fly-cal td { width: 26px; height: 20px; text-align: center; border: 1px solid transparent; cursor: default; }
  .w7fly-cal td:hover { background: #e5f3fb; border-color: #a5d2f5; }
  .w7fly-cal td.is-today { border-color: #3399ff; background: #dbeefc; }
  .w7fly-cal td.is-sel { background: #c4e3fb; border-color: #66a7e8; }
  .w7fly-cal td.is-other { color: #a0a0a0; }
  .w7fly-cal th { font-weight: 400; color: #555; height: 20px; }
  .w7fly-nav { all: unset; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 2px; cursor: default; }
  .w7fly-nav:hover { background: #e5f3fb; box-shadow: inset 0 0 0 1px #a5d2f5; }
  .w7fly-iconbtn { all: unset; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; border-color: transparent !important; border-radius: 3px; cursor: default; }
  .w7fly-iconbtn:hover { background: linear-gradient(180deg, #f3f8fd 0%, #dceafb 100%); border-color: #7da2ce !important; }
  .w7-link::before, .w7-link::after, .w7fly-nav::before, .w7fly-nav::after, .w7fly-iconbtn::before, .w7fly-iconbtn::after,
  .w7fly-tray button::before, .w7fly-tray button::after { content: none !important; }
  .w7fly-tray { display: grid; grid-template-columns: repeat(3, 28px); gap: 2px; padding: 6px; }
  .w7fly-tray button { all: unset; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 3px; border: 1px solid transparent; border-color: transparent !important; cursor: default; }
  .w7fly-tray button:hover { background: linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.12)); border-color: rgba(255,255,255,0.45) !important; }
`;

// ─── Volume ───────────────────────────────────────────────────────────────────
export function volumeIcon(volume: number, muted: boolean) {
  if (muted || volume === 0) return ICONS.volumeMuted;
  if (volume < 34) return ICONS.volumeLow;
  if (volume < 67) return ICONS.volumeMedium;
  return ICONS.volumeHigh;
}

export function MuteBadge({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ position: "absolute", right: -1, bottom: -1 }}>
      <circle cx="5" cy="5" r="4.2" fill="#e8402a" stroke="#fff" strokeWidth="1" />
      <path d="M3.2 3.2l3.6 3.6M6.8 3.2L3.2 6.8" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}

export function VolumeFlyout({ volume, muted, onVolume, onMute, onMixer }: {
  volume: number; muted: boolean;
  onVolume: (v: number) => void; onMute: () => void; onMixer: () => void;
}) {
  return (
    <div className="w7fly" style={{ width: 86 }}>
      <div className="w7fly-body">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 6px" }}>
          <img src={iconPath(ICONS.speakers, 32)} width={32} height={32} alt="" title="Speakers" />
          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>Speakers</div>
          <div style={{ height: 150, display: "flex", alignItems: "flex-start", justifyContent: "center", margin: "10px 0 6px" }}>
            <div className="is-vertical">
              <input
                type="range" min={0} max={100} value={muted ? 0 : volume}
                aria-label="Volume"
                onChange={(e) => onVolume(Number(e.target.value))}
              />
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 4 }}>{muted ? 0 : volume}</div>
          <button className="w7fly-iconbtn" style={{ width: 34, height: 30 }} aria-label={muted ? "Unmute Speakers" : "Mute Speakers"} title={muted ? "Unmute Speakers" : "Mute Speakers"} onClick={onMute}>
            <div style={{ position: "relative", width: 24, height: 24 }}>
              <img src={ICONS.volumeMuted} width={24} height={24} alt="" style={{ filter: "invert(0.75)" }} />
              {muted && <MuteBadge size={11} />}
            </div>
          </button>
        </div>
        <div className="w7fly-foot">
          <button className="w7-link" onClick={onMixer}>Mixer</button>
        </div>
      </div>
    </div>
  );
}

// ─── Clock ────────────────────────────────────────────────────────────────────
function AnalogClock({ now }: { now: Date }) {
  const s = now.getSeconds(), m = now.getMinutes() + s / 60, h = (now.getHours() % 12) + m / 60;
  const hand = (deg: number, len: number, w: number, color: string, tail = 6) => (
    <line x1={60 - Math.sin(deg) * tail} y1={60 + Math.cos(deg) * tail}
      x2={60 + Math.sin(deg) * len} y2={60 - Math.cos(deg) * len}
      stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
  const rad = (turns: number) => turns * Math.PI * 2;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-label={now.toLocaleTimeString()}>
      <defs>
        <radialGradient id="w7clk-face" cx="50%" cy="38%" r="65%">
          <stop offset="0" stopColor="#ffffff" /><stop offset="0.75" stopColor="#eef3f9" /><stop offset="1" stopColor="#d3dfec" />
        </radialGradient>
        <linearGradient id="w7clk-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8fbff" /><stop offset="0.5" stopColor="#9fb6cf" /><stop offset="1" stopColor="#5d7896" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="57" fill="url(#w7clk-rim)" stroke="#47607c" strokeWidth="1" />
      <circle cx="60" cy="60" r="51" fill="url(#w7clk-face)" stroke="#8ea6c0" strokeWidth="1" />
      {Array.from({ length: 60 }, (_, i) => {
        const a = rad(i / 60), major = i % 5 === 0;
        const r1 = major ? 42 : 45, r2 = 48;
        return <line key={i} x1={60 + Math.sin(a) * r1} y1={60 - Math.cos(a) * r1} x2={60 + Math.sin(a) * r2} y2={60 - Math.cos(a) * r2}
          stroke={major ? "#2b2b2b" : "#9aa7b5"} strokeWidth={major ? 2.2 : 1} />;
      })}
      {hand(rad(h / 12), 27, 4, "#1f1f1f")}
      {hand(rad(m / 60), 38, 3, "#1f1f1f")}
      {hand(rad(s / 60), 42, 1.2, "#c0392b", 10)}
      <circle cx="60" cy="60" r="3.2" fill="#1f1f1f" />
      <ellipse cx="60" cy="36" rx="40" ry="22" fill="#fff" opacity="0.28" />
    </svg>
  );
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Calendar({ today }: { today: Date }) {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState<string | null>(null);
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay());
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const key = (d: Date) => d.toDateString();
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  const tri = (dir: "l" | "r") => (
    <div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent",
      [dir === "l" ? "borderRight" : "borderLeft"]: "5px solid #4a6a91" }} />
  );
  return (
    <div style={{ width: 190 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px 4px" }}>
        <button className="w7fly-nav" aria-label="Previous month" onClick={() => shift(-1)}>{tri("l")}</button>
        <span style={{ color: "#1e395b" }}>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
        <button className="w7fly-nav" aria-label="Next month" onClick={() => shift(1)}>{tri("r")}</button>
      </div>
      <table className="w7fly-cal" style={{ borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead><tr>{WEEKDAYS.map((d) => <th key={d}>{d}</th>)}</tr></thead>
        <tbody>
          {Array.from({ length: 6 }, (_, w) => (
            <tr key={w}>
              {days.slice(w * 7, w * 7 + 7).map((d) => (
                <td
                  key={key(d)}
                  className={[
                    d.getMonth() !== month.getMonth() && "is-other",
                    key(d) === key(today) && "is-today",
                    key(d) === sel && "is-sel",
                  ].filter(Boolean).join(" ")}
                  onClick={() => setSel(key(d))}
                >
                  {d.getDate()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ClockFlyout({ onSettings }: { onSettings: () => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w7fly" style={{ width: 372 }}>
      <div className="w7fly-body">
        <div style={{ padding: "9px 12px 6px", color: "#0066cc" }}>
          {now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0 12px 10px", gap: 8 }}>
          <Calendar today={now} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 10 }}>
            <AnalogClock now={now} />
            <span style={{ color: "#333" }}>{now.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="w7fly-foot">
          <button className="w7-link" onClick={onSettings}>Change date and time settings...</button>
        </div>
      </div>
    </div>
  );
}

// ─── Network ──────────────────────────────────────────────────────────────────
function SignalBars({ level }: { level: number }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" style={{ flexShrink: 0 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={i * 3.6} y={12 - (i + 1) * 2.4} width="2.6" height={(i + 1) * 2.4}
          fill={i < level ? "#2f7d32" : "#c9d2dc"} stroke={i < level ? "#1d5e21" : "#aab6c3"} strokeWidth="0.5" />
      ))}
    </svg>
  );
}

const NETWORKS = [
  { name: "animesh.us", level: 5, secured: true },
  { name: "Pretty Fly for a WiFi", level: 3, secured: true },
  { name: "FBI Surveillance Van 4", level: 2, secured: true },
  { name: "Free Public WiFi", level: 1, secured: false },
];

export function NetworkFlyout({ online, onCenter }: { online: boolean; onCenter: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<{ name: string; state: "connecting" | "failed" } | null>(null);

  useEffect(() => {
    if (attempt?.state !== "connecting") return;
    const t = setTimeout(() => setAttempt({ name: attempt.name, state: "failed" }), 1800);
    return () => clearTimeout(t);
  }, [attempt]);

  const current = online ? NETWORKS[0] : null;
  return (
    <div className="w7fly" style={{ width: 290 }}>
      <div className="w7fly-body">
        <div style={{ padding: "8px 10px 4px", color: "#555" }}>{current ? "Currently connected to:" : "Not connected"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 12px 8px" }}>
          <img src={ICONS.network} width={32} height={32} alt="" style={{ filter: "invert(0.7)" }} />
          <div>
            <div style={{ fontWeight: 600 }}>{current ? current.name : "No connections are available"}</div>
            <div style={{ color: "#555" }}>{current ? "Internet access" : "Check your network cable or wireless switch"}</div>
          </div>
        </div>
        <div className="w7fly-hdr">Wireless Network Connection</div>
        <div style={{ padding: "2px 0 6px" }}>
          {NETWORKS.map((n) => {
            const connected = current?.name === n.name;
            const isOpen = open === n.name;
            return (
              <div key={n.name} className={`w7fly-row${isOpen ? " is-open" : ""}`} style={{ flexDirection: "column", alignItems: "stretch" }}
                onClick={() => { setOpen(isOpen ? null : n.name); setAttempt(null); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
                  {connected && <span style={{ color: "#555" }}>Connected</span>}
                  {n.secured && (
                    <svg width="9" height="11" viewBox="0 0 9 11" aria-label="Secured"><rect x="0.5" y="4.5" width="8" height="6" rx="1" fill="#d9b23b" stroke="#8c6a12" /><path d="M2.5 4.5V3a2 2 0 0 1 4 0v1.5" fill="none" stroke="#8c6a12" /></svg>
                  )}
                  <SignalBars level={n.level} />
                </div>
                {isOpen && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 6 }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ color: attempt?.name === n.name && attempt.state === "failed" ? "#c0392b" : "#555", fontSize: 11 }}>
                      {connected ? "Connected to the Internet"
                        : attempt?.name === n.name ? (attempt.state === "connecting" ? "Connecting..." : "Windows was unable to connect")
                        : n.secured ? "Security key required" : "Open network"}
                    </span>
                    <button disabled={attempt?.state === "connecting"} onClick={() => !connected && setAttempt({ name: n.name, state: "connecting" })}>
                      {connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="w7fly-foot">
          <button className="w7-link" onClick={onCenter}>Open Network and Sharing Center</button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Center ────────────────────────────────────────────────────────────
export function ActionCenterFlyout({ onOpen, onTroubleshoot }: { onOpen: () => void; onTroubleshoot: () => void }) {
  return (
    <div className="w7fly" style={{ width: 260 }}>
      <div className="w7fly-body">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 12px 14px" }}>
          <img src={ICONS.actionCenter} width={24} height={24} alt="" style={{ filter: "invert(0.7)" }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>No current issues detected</div>
            <div style={{ color: "#555" }}>Action Center has no new messages.</div>
          </div>
        </div>
        <div className="w7fly-foot" style={{ flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "6px 12px" }}>
          <button className="w7-link" onClick={onTroubleshoot}>Troubleshoot a problem</button>
          <button className="w7-link" onClick={onOpen}>Open Action Center</button>
        </div>
      </div>
    </div>
  );
}

// ─── Hidden icons (the ^ chevron) ─────────────────────────────────────────────
export function HiddenIconsFlyout({ items, onCustomize, style }: {
  items: { label: string; icon: string; onClick: () => void }[];
  onCustomize: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div className="w7fly" style={{ padding: 0, ...style }}>
      <div className="w7fly-tray">
        {items.map((it) => (
          <button key={it.label} title={it.label} aria-label={it.label} onClick={it.onClick}>
            <img src={iconPath(it.icon, 16)} width={16} height={16} alt="" />
          </button>
        ))}
      </div>
      <div style={{ padding: "0 8px 6px", textAlign: "center" }}>
        <button className="w7-link" style={{ color: "#fff", textShadow: "0 0 5px rgba(0,0,0,0.9)" }} onClick={onCustomize}>Customize...</button>
      </div>
    </div>
  );
}
