"use client";
import React, { useEffect, useRef, useState } from "react";
import Dialog from "./Dialog";
import OwnedDialog from "./OwnedDialog";
import { Check, Radio } from "./dialogKit";
import { FONT, itemStyle } from "./Chrome";
import { playSound, levelOf, SOUND_FILES, STARTUP_FILE, type Playback } from "./soundEngine";
import type { WindowProps } from "../Desktop/windows";

// Control Panel ▸ Sound (mmsys.cpl): Playback / Recording / Sounds / Communications.

type Tab = "Playback" | "Recording" | "Sounds" | "Communications";
type Settings = {
  defaultDevice: string;
  commDevice: string;
  scheme: string;
  events: Record<string, string>;
  startup: boolean;
  comms: number;
  volume: number;
  muted: boolean;
  channels: string;
};

const EVENT_GROUPS: { group: string; events: [string, string][] }[] = [
  { group: "Windows", events: [
    ["Asterisk", "Windows Background.wav"], ["Calendar Reminder", "Windows Notify.wav"], ["Close Program", ""],
    ["Critical Battery Alarm", "Windows Battery Critical.wav"], ["Critical Stop", "Windows Critical Stop.wav"],
    ["Default Beep", "Windows Ding.wav"], ["Desktop Mail Notification", "Windows Notify.wav"],
    ["Device Connect", "Windows Hardware Insert.wav"], ["Device Disconnect", "Windows Hardware Remove.wav"],
    ["Device Failed to Connect", "Windows Hardware Fail.wav"], ["Exclamation", "Windows Exclamation.wav"],
    ["Exit Windows", ""], ["Low Battery Alarm", "Windows Battery Low.wav"], ["Maximize", ""], ["Menu Command", ""],
    ["Menu Pop-up", ""], ["Minimize", ""], ["New Fax Notification", "Windows Notify.wav"],
    ["New Text Message Notification", "Windows Notify.wav"], ["Notification", "Windows Notify.wav"],
    ["Print Complete", "Windows Print complete.wav"], ["Program Error", "Windows Error.wav"], ["Question", ""],
    ["Restore Down", ""], ["Restore Up", ""], ["Select", ""], ["Show Toolbar Band", ""],
    ["System Notification", "Windows Balloon.wav"], ["Windows Change Theme", ""],
    ["Windows Logoff", "Windows Logoff Sound.wav"], ["Windows Logon", STARTUP_FILE],
    ["Windows User Account Control", "Windows User Account Control.wav"],
  ] },
  { group: "Windows Explorer", events: [
    ["Blocked Pop-up Window", "Windows Pop-up Blocked.wav"], ["Complete Navigation", ""],
    ["Empty Recycle Bin", "Windows Recycle.wav"], ["Feed Discovered", ""], ["Move Menu Item", ""],
    ["Notification bar", "Windows Information Bar.wav"], ["Search Provider Discovered", ""],
    ["Start Navigation", "Windows Navigation Start.wav"],
  ] },
];
const DEFAULT_EVENTS = Object.fromEntries(EVENT_GROUPS.flatMap((g) => g.events));
const DEFAULTS: Settings = {
  defaultDevice: "speakers", commDevice: "speakers", scheme: "Windows Default", events: DEFAULT_EVENTS,
  startup: true, comms: 1, volume: 100, muted: false, channels: "Stereo",
};

function load(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem("win7-sound") ?? "{}") }; } catch { return DEFAULTS; }
}

// ─── icons ───────────────────────────────────────────────────────────────────
function DeviceIcon({ kind, badge }: { kind: "speakers" | "spdif" | "mic" | "line"; badge?: "default" | "comm" | "unplugged" }) {
  return (
    <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
      <svg width="32" height="32" viewBox="0 0 32 32">
        <defs>
          <linearGradient id="sd-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8a8f96" /><stop offset="1" stopColor="#2e3136" /></linearGradient>
          <radialGradient id="sd-cone" cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#f4f6f8" /><stop offset=".6" stopColor="#9aa1aa" /><stop offset="1" stopColor="#4b5058" /></radialGradient>
          <linearGradient id="sd-mic" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5b6068" /><stop offset=".5" stopColor="#d9dde2" /><stop offset="1" stopColor="#5b6068" /></linearGradient>
        </defs>
        {kind === "speakers" && (<>
          <rect x="7" y="2" width="18" height="28" rx="2.5" fill="url(#sd-box)" stroke="#202226" />
          <circle cx="16" cy="9" r="3.4" fill="url(#sd-cone)" />
          <circle cx="16" cy="20.5" r="6.6" fill="url(#sd-cone)" />
          <circle cx="16" cy="20.5" r="2" fill="#3a3e44" />
        </>)}
        {kind === "spdif" && (<>
          <rect x="3" y="8" width="26" height="16" rx="3" fill="url(#sd-box)" stroke="#202226" />
          <rect x="9" y="12" width="14" height="8" rx="2" fill="#15171a" />
          <circle cx="16" cy="16" r="2.2" fill="#ff4b3a" />
        </>)}
        {kind === "mic" && (<>
          <rect x="12" y="3" width="8" height="15" rx="4" fill="url(#sd-mic)" stroke="#3c4047" />
          <path d="M9 13a7 7 0 0 0 14 0" fill="none" stroke="#5b6068" strokeWidth="1.6" />
          <rect x="15.2" y="20" width="1.6" height="6" fill="#5b6068" />
          <rect x="10" y="26" width="12" height="2.5" rx="1" fill="#5b6068" />
        </>)}
        {kind === "line" && (<>
          <rect x="4" y="11" width="18" height="10" rx="2" fill="url(#sd-box)" stroke="#202226" />
          <rect x="22" y="14" width="7" height="4" fill="url(#sd-mic)" />
          <circle cx="11" cy="16" r="2.6" fill="#7fb4e6" stroke="#1d4f86" />
        </>)}
      </svg>
      {badge && (
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ position: "absolute", left: badge === "unplugged" ? 18 : -1, bottom: -1 }}>
          <circle cx="7" cy="7" r="6.2" fill={badge === "unplugged" ? "#d9241b" : "#2f9e2f"} stroke="#fff" strokeWidth="1.2" />
          {badge === "default" && <path d="M3.8 7.2l2.1 2.1 4.3-4.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
          {badge === "comm" && <path d="M4 5c0 3 2 5 5 5l1-1.4-1.6-1-1 .7c-1-.4-1.7-1.1-2.1-2.1l.7-1-1-1.6z" fill="#fff" />}
          {badge === "unplugged" && <path d="M7 3.5v5M4.6 6.5L7 9l2.4-2.5" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      )}
    </div>
  );
}

function Meter({ level }: { level: number }) {
  const lit = Math.round(level * 10);
  return (
    <div style={{ display: "flex", flexDirection: "column-reverse", gap: 1, width: 8, flexShrink: 0 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{
          height: 2, borderRadius: 0.5,
          background: i < lit ? "linear-gradient(90deg,#3fc84a,#1f9d2b)" : "#e2e2e2",
          boxShadow: i < lit ? "none" : "inset 0 0 0 1px #d0d0d0",
        }} />
      ))}
    </div>
  );
}

// Live level from whatever is currently playing
function useLevel(playback: Playback | null) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!playback) { setLevel(0); return; }
    const buf = new Float32Array(playback.analyser.fftSize);
    let raf = 0;
    const tick = () => { setLevel(levelOf(playback.analyser, buf)); raf = requestAnimationFrame(tick); };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [playback]);
  return level;
}

// ─── device list ─────────────────────────────────────────────────────────────
type Device = { id: string; kind: "speakers" | "spdif" | "mic" | "line"; name: string; sub: string };
const PLAYBACK: Device[] = [
  { id: "speakers", kind: "speakers", name: "Speakers", sub: "High Definition Audio Device" },
  { id: "spdif", kind: "spdif", name: "Digital Audio (S/PDIF)", sub: "High Definition Audio Device" },
];
const RECORDING: Device[] = [
  { id: "mic", kind: "mic", name: "Microphone", sub: "High Definition Audio Device" },
  { id: "line", kind: "line", name: "Line In", sub: "High Definition Audio Device" },
];

function DeviceList({ devices, selected, onSelect, status, badge, level, disabled, onOpen }: {
  devices: Device[]; selected: string | null; onSelect: (id: string) => void;
  status: (d: Device) => string; badge: (d: Device) => "default" | "comm" | "unplugged" | undefined;
  level?: (d: Device) => number; disabled?: boolean; onOpen?: (id: string) => void;
}) {
  const [hov, setHov] = useState<string | null>(null);
  return (
    <div style={{ height: 210, overflowY: "auto", background: "#fff", border: "1px solid #828790", padding: 2 }}>
      {devices.map((d) => (
        <div
          key={d.id}
          onClick={() => onSelect(d.id)}
          onDoubleClick={() => onOpen?.(d.id)}
          onMouseEnter={() => setHov(d.id)}
          onMouseLeave={() => setHov(null)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "5px 8px 5px 6px", marginBottom: 1,
            borderRadius: 3, cursor: "default", ...itemStyle(selected === d.id, hov === d.id),
          }}
        >
          <div style={{ opacity: disabled ? 0.55 : 1 }}><DeviceIcon kind={d.kind} badge={badge(d)} /></div>
          <div style={{ flex: 1, minWidth: 0, lineHeight: "15px", color: disabled ? "#6d6d6d" : "#000" }}>
            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
            <div style={{ color: "#6d6d6d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.sub}</div>
            <div style={{ color: "#6d6d6d" }}>{status(d)}</div>
          </div>
          {level && <Meter level={level(d)} />}
        </div>
      ))}
    </div>
  );
}

// ─── dialog ──────────────────────────────────────────────────────────────────
export default function SoundDialog({ app, ...props }: WindowProps) {
  const body = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("Playback");
  const [saved, setSaved] = useState<Settings>(DEFAULTS);
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [sel, setSel] = useState<string | null>("speakers");
  const [recSel, setRecSel] = useState<string | null>(null);
  const [event, setEvent] = useState<string | null>("Windows Logon");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [splitOpen, setSplitOpen] = useState(false);
  const [sub, setSub] = useState<null | "properties" | "setup">(null);
  const [playback, setPlayback] = useState<{ device: string; p: Playback } | null>(null);
  const level = useLevel(playback?.p ?? null);

  useEffect(() => { const l = load(); setSaved(l); setS(l); }, []);
  useEffect(() => () => playback?.p.stop(), [playback]);

  const dirty = JSON.stringify(s) !== JSON.stringify(saved);
  const apply = () => { localStorage.setItem("win7-sound", JSON.stringify(s)); setSaved(s); };
  const set = (patch: Partial<Settings>) => setS((prev) => ({ ...prev, ...patch }));

  const test = async (file: string, device = s.defaultDevice, vol = s.muted ? 0 : s.volume / 100) => {
    playback?.p.stop();
    const p = await playSound(file, vol);
    setPlayback({ device, p });
    p.done.then(() => setPlayback((cur) => (cur?.p === p ? null : cur)));
  };

  const setEventSound = (file: string) => {
    if (!event) return;
    const events = { ...s.events, [event]: file };
    const matches = JSON.stringify(events) === JSON.stringify(DEFAULT_EVENTS);
    set({ events, scheme: matches ? "Windows Default" : "Windows Default (modified)" });
  };
  const setScheme = (scheme: string) => {
    if (scheme === "No Sounds") set({ scheme, events: Object.fromEntries(Object.keys(DEFAULT_EVENTS).map((k) => [k, ""])) });
    else if (scheme === "Windows Default") set({ scheme, events: DEFAULT_EVENTS });
    else set({ scheme });
  };

  const tabs: Tab[] = ["Playback", "Recording", "Sounds", "Communications"];
  const p: React.CSSProperties = { margin: "0 0 8px", lineHeight: 1.4 };
  const sel_ = PLAYBACK.find((d) => d.id === sel);

  return (
    <Dialog
      {...props}
      title="Sound"
      icon="/icons/sound.png"
      width="412px"
      height="476px"
      footer={<>
        <button className="default" onClick={() => { apply(); props.onClose(); }}>OK</button>
        <button onClick={props.onClose}>Cancel</button>
        <button disabled={!dirty} onClick={apply}>Apply</button>
      </>}
    >
      <div ref={body} style={{ fontFamily: FONT, fontSize: 12, color: "#000" }}>
        <menu role="tablist" aria-label="Sound">
          {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>
          ))}
        </menu>
        <article role="tabpanel" style={{ padding: 10, marginBottom: 0, minHeight: 330 }}>
          {tab === "Playback" && (<>
            <p style={p}>Select a playback device below to modify its settings:</p>
            <DeviceList
              devices={PLAYBACK} selected={sel} onSelect={setSel}
              onOpen={(id) => { setSel(id); setSub("properties"); }}
              badge={(d) => (d.id === s.defaultDevice ? "default" : d.id === s.commDevice ? "comm" : undefined)}
              status={(d) => (d.id === s.defaultDevice ? "Default Device" : d.id === s.commDevice ? "Default Communications Device" : "Ready")}
              level={(d) => (playback?.device === d.id ? level : 0)}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 10, position: "relative" }}>
              <button disabled={!sel} onClick={() => setSub("setup")}>Configure</button>
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex" }}>
                <button
                  disabled={!sel || (sel === s.defaultDevice && sel === s.commDevice)}
                  onClick={() => sel && set({ defaultDevice: sel, commDevice: sel })}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, minWidth: 70 }}
                >Set Default</button>
                <button
                  aria-label="More default options" disabled={!sel}
                  onClick={() => setSplitOpen((o) => !o)}
                  style={{ minWidth: 0, width: 18, padding: 0, marginLeft: -1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, fontSize: 8 }}
                >▼</button>
              </div>
              <button disabled={!sel} onClick={() => setSub("properties")}>Properties</button>
              {splitOpen && sel && (
                <div role="menu" style={{
                  position: "absolute", right: 80, top: 24, zIndex: 5, background: "#f0f0f0",
                  border: "1px solid #979797", padding: 2, boxShadow: "3px 3px 3px -1px rgba(0,0,0,.35)", whiteSpace: "nowrap",
                }}>
                  {[["Default Device", () => set({ defaultDevice: sel })], ["Default Communication Device", () => set({ commDevice: sel })]].map(([label, fn]) => (
                    <div key={label as string} role="menuitem" className="sd-menuitem"
                      onClick={() => { (fn as () => void)(); setSplitOpen(false); }}
                      style={{ padding: "3px 20px 3px 30px", borderRadius: 3, border: "1px solid transparent", cursor: "default" }}
                    >{label as string}</div>
                  ))}
                </div>
              )}
            </div>
          </>)}

          {tab === "Recording" && (<>
            <p style={p}>Select a recording device below to modify its settings:</p>
            <DeviceList
              devices={RECORDING} selected={recSel} onSelect={setRecSel} disabled
              badge={() => "unplugged"} status={() => "Not plugged in"}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button disabled>Configure</button>
              <div style={{ flex: 1 }} />
              <button disabled>Set Default</button>
              <button disabled>Properties</button>
            </div>
          </>)}

          {tab === "Sounds" && (<>
            <p style={p}>A sound theme is a set of sounds applied to events in Windows and programs. You can select an existing scheme or save one you have modified.</p>
            <label htmlFor="sd-scheme">Sound Scheme:</label>
            <div style={{ display: "flex", gap: 6, margin: "3px 0 8px" }}>
              <select id="sd-scheme" value={s.scheme} onChange={(e) => setScheme(e.target.value)} style={{ flex: 1, minWidth: 0 }}>
                {s.scheme === "Windows Default (modified)" && <option>Windows Default (modified)</option>}
                <option>Windows Default</option>
                <option>No Sounds</option>
              </select>
              <button disabled style={{ minWidth: 0, padding: "0 10px" }}>Save As...</button>
              <button disabled style={{ minWidth: 0, padding: "0 10px" }}>Delete</button>
            </div>
            <p style={p}>To change sounds, click a program event in the following list and then select a sound to apply. You can save the changes as a new sound scheme.</p>
            <div>Program Events:</div>
            <div style={{ height: 112, overflowY: "auto", background: "#fff", border: "1px solid #828790", margin: "3px 0 8px", userSelect: "none" }}>
              {EVENT_GROUPS.map((g) => (
                <div key={g.group}>
                  <div onClick={() => setCollapsed((c) => ({ ...c, [g.group]: !c[g.group] }))}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "1px 3px", cursor: "default" }}>
                    <svg width="9" height="9" viewBox="0 0 9 9">
                      {collapsed[g.group] ? <path d="M2 1l4.5 3.5L2 8z" fill="none" stroke="#8a8a8a" /> : <path d="M8 2v6H2z" fill="#595959" />}
                    </svg>
                    <img src="/icons/computer.png" width={14} height={14} alt="" />
                    {g.group}
                  </div>
                  {!collapsed[g.group] && g.events.map(([name]) => (
                    <div key={name} onClick={() => setEvent(name)}
                      style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "0 3px 0 30px", lineHeight: "17px",
                        background: event === name ? "#3399ff" : "transparent", color: event === name ? "#fff" : "#000",
                      }}>
                      <span style={{ width: 14, display: "inline-flex" }}>
                        {s.events[name] && (
                          <svg width="13" height="13" viewBox="0 0 13 13">
                            <path d="M1.5 4.5h2.5L7 2v9L4 8.5H1.5z" fill={event === name ? "#fff" : "#5a7fa8"} />
                            <path d="M8.7 4.4a3 3 0 0 1 0 4.2M10.2 3a5 5 0 0 1 0 7" fill="none" stroke={event === name ? "#fff" : "#5a7fa8"} strokeWidth="1.1" />
                          </svg>
                        )}
                      </span>
                      {name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <Check label="Play Windows Startup sound" checked={s.startup} onChange={(v) => set({ startup: v })} />
            <div style={{ marginTop: 8 }}><label htmlFor="sd-sound">Sounds:</label></div>
            <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
              <select id="sd-sound" disabled={!event} value={event ? s.events[event] : ""} onChange={(e) => setEventSound(e.target.value)} style={{ flex: 1, minWidth: 0 }}>
                <option value="">(None)</option>
                {SOUND_FILES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <button disabled={!event || !s.events[event]} onClick={() => event && test(s.events[event])}
                style={{ minWidth: 0, padding: "0 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 0l7 4.5L1 9z" fill="#2b6a2b" /></svg> Test
              </button>
              <button disabled style={{ minWidth: 0, padding: "0 10px" }}>Browse...</button>
            </div>
          </>)}

          {tab === "Communications" && (<>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "4px 0 14px" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
                <defs><linearGradient id="sd-ph" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6d7480" /><stop offset="1" stopColor="#24272c" /></linearGradient></defs>
                <path d="M6 5c3-2 5-1 6 1l2 4c.6 1.3 0 2.6-1.2 3.3l-1.6.9c1.4 3 3.6 5.2 6.6 6.6l.9-1.6c.7-1.2 2-1.8 3.3-1.2l4 2c2 1 3 3 1 6-2 3-6 3-10 1C10 24 5 18 3 12 2 9 3 7 6 5z" fill="url(#sd-ph)" />
              </svg>
              <span style={{ lineHeight: 1.4 }}>Windows can automatically adjust the volume of different sounds when you are using your PC to place or receive telephone calls.</span>
            </div>
            <p style={p}>When Windows detects communications activity:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 10 }}>
              {["Mute all other sounds", "Reduce the volume of other sounds by 80%", "Reduce the volume of other sounds by 50%", "Do nothing"].map((label, i) => (
                <Radio key={label} name="sd-comms" label={label} checked={s.comms === i} onChange={() => set({ comms: i })} />
              ))}
            </div>
          </>)}
        </article>
      </div>
      <style>{`.sd-menuitem:hover { background: linear-gradient(180deg,#fff9,#e6ecf5cc 90%,#fffc); border-color: #b8d6fb !important; }`}</style>

      {sub === "properties" && sel_ && (
        <PropertiesDialog
          device={sel_} owner={body} zIndex={1002 + props.zIndex} settings={s}
          onApply={(patch) => set(patch)} onTest={() => test(STARTUP_FILE, sel_.id)}
          onClose={() => setSub(null)} onFocus={props.onFocus}
        />
      )}
      {sub === "setup" && sel_ && (
        <SpeakerSetup
          owner={body} zIndex={1002 + props.zIndex} channels={s.channels} level={playback ? level : 0}
          onTest={() => test(STARTUP_FILE, sel_.id)} onFinish={(channels) => { set({ channels }); setSub(null); }}
          onClose={() => setSub(null)} onFocus={props.onFocus}
        />
      )}
    </Dialog>
  );
}

// ─── Speakers Properties ─────────────────────────────────────────────────────
function PropertiesDialog({ device, settings, onApply, onTest, ...o }: {
  device: Device; settings: Settings; onApply: (patch: Partial<Settings>) => void; onTest: () => void;
  owner: React.RefObject<HTMLElement | null>; zIndex: number; onClose: () => void; onFocus?: () => void;
}) {
  const [tab, setTab] = useState<"General" | "Levels">("General");
  const [volume, setVolume] = useState(settings.volume);
  const [muted, setMuted] = useState(settings.muted);
  const changed = volume !== settings.volume || muted !== settings.muted;
  const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
  return (
    <OwnedDialog
      title={`${device.name} Properties`} width={372} {...o}
      footer={<>
        <button className="default" onClick={() => { onApply({ volume, muted }); o.onClose(); }}>OK</button>
        <button onClick={o.onClose}>Cancel</button>
        <button disabled={!changed} onClick={() => onApply({ volume, muted })}>Apply</button>
      </>}
    >
      <menu role="tablist" aria-label="Properties">
        {(["General", "Levels"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>
        ))}
        <button role="tab" aria-selected={false} disabled>Enhancements</button>
        <button role="tab" aria-selected={false} disabled>Advanced</button>
      </menu>
      <article role="tabpanel" style={{ padding: 12, marginBottom: 0, minHeight: 250 }}>
        {tab === "General" ? (<>
          <div style={{ ...row, marginBottom: 12 }}>
            <DeviceIcon kind={device.kind} />
            <input type="text" defaultValue={device.name} style={{ flex: 1, minWidth: 0 }} />
            <button disabled style={{ minWidth: 0, padding: "0 10px" }}>Change Icon</button>
          </div>
          <div style={{ height: 1, background: "#d5dfe5", margin: "0 0 10px" }} />
          <div style={{ color: "#1e3287", marginBottom: 4 }}>Controller Information</div>
          <div style={{ ...row, justifyContent: "space-between", paddingLeft: 12, marginBottom: 12 }}>
            <span>{device.sub}<br />Microsoft</span>
            <button disabled>Properties</button>
          </div>
          <div style={{ color: "#1e3287", marginBottom: 4 }}>Jack Information</div>
          <div style={{ paddingLeft: 12, marginBottom: 12 }}>{device.kind === "spdif" ? "Rear Panel S/PDIF Out" : "Front Panel 3.5mm Jack"}</div>
          <label htmlFor="sd-usage" style={{ display: "block", marginBottom: 3 }}>Device usage:</label>
          <select id="sd-usage" defaultValue="on" style={{ width: "100%" }}>
            <option value="on">Use this device (enable)</option>
            <option value="off">Don&apos;t use this device (disable)</option>
          </select>
        </>) : (<>
          <div style={{ marginBottom: 6 }}>{device.name}</div>
          <div style={row}>
            <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(+e.target.value)} style={{ flex: 1 }} aria-label="Volume" />
            <input type="text" value={volume} readOnly style={{ width: 36, textAlign: "center" }} />
            <button
              aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted(!muted)}
              style={{ minWidth: 0, width: 28, height: 26, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 6h3l4-3v10l-4-3H2z" fill="#4d6f95" />
                {muted
                  ? <><circle cx="12.5" cy="11.5" r="3.2" fill="#d9241b" /><path d="M10.8 9.8l3.4 3.4" stroke="#fff" strokeWidth="1.3" /></>
                  : <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.5 4a5.5 5.5 0 0 1 0 8" fill="none" stroke="#4d6f95" strokeWidth="1.2" />}
              </svg>
            </button>
            <button disabled style={{ minWidth: 0, padding: "0 10px" }}>Balance</button>
          </div>
          <div style={{ marginTop: 18 }}>
            <button onClick={onTest} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 0l7 4.5L1 9z" fill="#2b6a2b" /></svg> Test
            </button>
          </div>
        </>)}
      </article>
    </OwnedDialog>
  );
}

// ─── Speaker Setup wizard ────────────────────────────────────────────────────
function SpeakerSetup({ channels, level, onTest, onFinish, ...o }: {
  channels: string; level: number; onTest: () => void; onFinish: (channels: string) => void;
  owner: React.RefObject<HTMLElement | null>; zIndex: number; onClose: () => void; onFocus?: () => void;
}) {
  const [page, setPage] = useState(0);
  const [ch, setCh] = useState(channels);
  const glow = (on: boolean): React.CSSProperties => ({
    width: 34, height: 46, borderRadius: 4, border: "1px solid #2e3136",
    background: on ? "linear-gradient(135deg,#9ad8ff,#2c7fd0)" : "linear-gradient(135deg,#8a8f96,#2e3136)",
    boxShadow: on ? "0 0 10px #4aa8ff" : "none", transition: "all 80ms",
  });
  return (
    <OwnedDialog
      title="Speaker Setup" width={470} bright {...o}
      footer={page === 0 ? <>
        <button className="default" onClick={() => setPage(1)}>Next</button>
        <button onClick={o.onClose}>Cancel</button>
      </> : <>
        <button className="default" onClick={() => onFinish(ch)}>Finish</button>
      </>}
    >
      {page === 0 ? (<>
        <div className="instruction instruction-primary" style={{ margin: "0 0 14px" }}>Choose your configuration</div>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 150px" }}>
            <div style={{ marginBottom: 4 }}>Audio channels:</div>
            {["Stereo", "Quadraphonic", "5.1 Surround", "7.1 Surround"].map((c) => (
              <div key={c} onClick={() => setCh(c)} style={{
                padding: "1px 4px", cursor: "default", border: "1px solid transparent",
                background: ch === c ? "#3399ff" : "transparent", color: ch === c ? "#fff" : "#000",
              }}>{c}</div>
            ))}
            <button onClick={onTest} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 0l7 4.5L1 9z" fill="#2b6a2b" /></svg> Test
            </button>
          </div>
          <div style={{ flex: "1 1 200px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 6px" }}>
            <div style={glow(level > 0.05)} onClick={onTest} title="Front Left" />
            <img src="/icons/computer.png" width={64} height={64} alt="" />
            <div style={glow(level > 0.05)} onClick={onTest} title="Front Right" />
          </div>
        </div>
        <p style={{ marginTop: 14, color: "#555" }}>Click a speaker above to test it.</p>
      </>) : (
        <div className="instruction instruction-primary" style={{ margin: "0 0 40px" }}>Configuration complete</div>
      )}
    </OwnedDialog>
  );
}
