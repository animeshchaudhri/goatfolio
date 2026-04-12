"use client";
import React, { useState, useCallback } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useWindowControls } from "../DraggableWindow/WindowContext";
import "7.css/dist/7.css";

// ─── Sprite icon (matches Filenavbar positions) ───────────────────────────────
type SpriteName = "chevron-left" | "chevron-right" | "chevron-down" | "chevron-up" | "folder" | "chevron-small-right";

const SPRITE: Record<SpriteName, { pos: string; w: number; h: number }> = {
  "chevron-left":        { pos: "0px 0px",     w: 24, h: 24 },
  "chevron-right":       { pos: "-64px 0px",   w: 24, h: 24 },
  "chevron-down":        { pos: "-84px -24px", w: 18, h: 18 },
  "chevron-up":          { pos: "0px -24px",   w: 24, h: 18 },
  "folder":              { pos: "-72px -96px", w: 24, h: 24 },
  "chevron-small-right": { pos: "-48px -24px", w: 16, h: 16 },
};

function Sp({ name, size = 16 }: { name: SpriteName; size?: number }) {
  const s = SPRITE[name];
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      backgroundImage: 'url("/icons/Sprite.png")',
      backgroundPosition: s.pos,
      backgroundRepeat: "no-repeat",
      backgroundSize: "128px 168px",
    }} />
  );
}

// ─── Win7 circular nav button ─────────────────────────────────────────────────
function NavBtn({ dir, disabled }: { dir: "back" | "fwd"; disabled?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => !disabled && setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 23, height: 23, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, cursor: disabled ? "default" : "pointer",
        background: disabled
          ? "linear-gradient(180deg,#d8d8d8 0%,#c0c0c0 100%)"
          : h
          ? "linear-gradient(180deg,#6ec6f5 0%,#228bd0 50%,#1470b8 100%)"
          : "linear-gradient(180deg,#55b8f0 0%,#1a80c8 50%,#1060b0 100%)",
        border: `1px solid ${disabled ? "#a8a8a8" : h ? "#0a58b0" : "#1060a8"}`,
        boxShadow: disabled ? "none" : h
          ? "0 1px 4px rgba(0,80,200,0.5),inset 0 1px 0 rgba(255,255,255,0.35)"
          : "0 1px 3px rgba(0,60,160,0.4),inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <Sp name={dir === "back" ? "chevron-left" : "chevron-right"} size={14} />
    </div>
  );
}

// ─── Address bar ─────────────────────────────────────────────────────────────
function AddressBar() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 3,
      padding: "2px 5px 2px 4px", height: 32,
      background: "linear-gradient(180deg,#f7f7f7 0%,#eeeeee 100%)",
      borderBottom: "1px solid #b8b8b8",
    }}>
      <NavBtn dir="back" disabled />
      <div style={{ width: 2 }} />
      <NavBtn dir="fwd" disabled />
      <div style={{
        width: 14, height: 14, display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", marginLeft: 1,
      }}>
        <Sp name="chevron-down" size={12} />
      </div>

      {/* breadcrumb */}
      <div style={{
        flex: 1, height: 22,
        background: "#fff",
        border: "1px solid #aabcd8",
        display: "flex", alignItems: "center",
        padding: "0 6px", gap: 4,
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        borderRadius: 2,
      }}>
        <img src="/icons/computer.png" width={14} height={14}
          alt="" style={{ imageRendering: "pixelated" }} />
        <span style={{
          fontSize: 12, fontFamily: "Segoe UI,Tahoma,sans-serif",
          color: "#1a1a1a",
        }}>Computer</span>
        <div style={{ marginLeft: 2, opacity: 0.5 }}>
          <Sp name="chevron-small-right" size={12} />
        </div>
      </div>

      {/* search */}
      <div style={{
        width: 152, height: 22,
        background: "#fff",
        border: "1px solid #aabcd8",
        display: "flex", alignItems: "center",
        padding: "0 5px", gap: 3,
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
        borderRadius: 2,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="#999" strokeWidth="1.2"/>
          <line x1="8" y1="8" x2="11" y2="11" stroke="#999" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontSize: 11, fontFamily: "Segoe UI,Tahoma,sans-serif", color: "#aaa",
        }}>Search Computer</span>
      </div>
    </div>
  );
}

// ─── Command bar ─────────────────────────────────────────────────────────────
const CMDS = [
  { label: "Organize", arrow: true },
  { label: "System properties" },
  { label: "Uninstall or change a program" },
  { label: "Map network drive", arrow: true },
  { label: "Open Control Panel" },
];

function CommandBar() {
  const [hov, setHov] = useState<string | null>(null);
  return (
    <div style={{
      display: "flex", alignItems: "center",
      height: 27, paddingLeft: 6,
      background: "linear-gradient(180deg,#fafafa 0%,#f0f0f0 100%)",
      borderBottom: "1px solid #c8c8c8",
      userSelect: "none", flexShrink: 0,
    }}>
      {CMDS.map((cmd, i) => (
        <React.Fragment key={cmd.label}>
          <div
            onMouseEnter={() => setHov(cmd.label)}
            onMouseLeave={() => setHov(null)}
            style={{
              display: "flex", alignItems: "center", gap: 2,
              height: "100%", padding: "0 9px",
              fontSize: 11.5, fontFamily: "Segoe UI,Tahoma,sans-serif",
              color: hov === cmd.label ? "#000" : "#1a1a1a",
              cursor: "default",
              background: hov === cmd.label
                ? "linear-gradient(180deg,rgba(255,255,255,0.95) 0%,rgba(195,220,252,0.85) 100%)"
                : "transparent",
              borderRight: i === 0 ? "1px solid #d0d0d0" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {cmd.label}
            {cmd.arrow && (
              <span style={{ fontSize: 8, marginLeft: 1, opacity: 0.7 }}>▾</span>
            )}
          </div>
        </React.Fragment>
      ))}
      {/* view toggle on far right */}
      <div style={{
        marginLeft: "auto", display: "flex", alignItems: "center",
        height: "100%", borderLeft: "1px solid #d0d0d0", padding: "0 6px", gap: 1,
      }}>
        {/* views icon */}
        <div style={{
          width: 20, height: 20, display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "default", position: "relative",
        }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="1" width="5" height="5" fill="#555" rx="0.5"/>
            <rect x="8" y="1" width="5" height="5" fill="#555" rx="0.5"/>
            <rect x="1" y="8" width="5" height="5" fill="#555" rx="0.5"/>
            <rect x="8" y="8" width="5" height="5" fill="#555" rx="0.5"/>
          </svg>
        </div>
        <div style={{ cursor: "default" }}>
          <Sp name="chevron-down" size={12} />
        </div>
      </div>
    </div>
  );
}

// ─── Nav pane ─────────────────────────────────────────────────────────────────
type TreeItem = { label: string; icon?: React.ReactNode; indent?: number };
type TreeGroup = {
  label: string; icon: React.ReactNode;
  items: TreeItem[]; defaultOpen?: boolean;
};

const TREE: TreeGroup[] = [
  {
    label: "Favorites", icon: <img src="/icons/pet.png" width={14} height={14} alt="" />,
    defaultOpen: true,
    items: [
      { label: "Desktop",       icon: <img src="/icons/computer.png" width={14} height={14} alt="" /> },
      { label: "Downloads",     icon: <Sp name="folder" size={14} /> },
      { label: "Recent Places", icon: <Sp name="folder" size={14} /> },
    ],
  },
  {
    label: "Libraries", icon: <Sp name="folder" size={14} />,
    defaultOpen: false,
    items: [
      { label: "Documents" }, { label: "Music" }, { label: "Pictures" }, { label: "Videos" },
    ],
  },
  {
    label: "Computer", icon: <img src="/icons/computer.png" width={14} height={14} alt="" />,
    defaultOpen: true,
    items: [
      { label: "Local Disk (C:)",  icon: <img src="/icons/computer.png" width={14} height={14} alt="" /> },
      { label: "DVD RW Drive (D:)",icon: <img src="/icons/pdf.png" width={14} height={14} alt="" /> },
    ],
  },
  {
    label: "Network", icon: <img src="/icons/internet.png" width={14} height={14} alt="" />,
    defaultOpen: false,
    items: [],
  },
];

function NavPane({ navSel, setNavSel }: { navSel: string; setNavSel: (s: string) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(TREE.map(g => [g.label, g.defaultOpen ?? false]))
  );

  return (
    <div style={{
      width: 180, flexShrink: 0,
      background: "#EFF5FC",
      borderRight: "1px solid #C0CDD8",
      overflowY: "auto", overflowX: "hidden",
      fontFamily: "Segoe UI,Tahoma,sans-serif",
      fontSize: 12, userSelect: "none",
      paddingTop: 3,
    }}>
      {TREE.map(group => (
        <div key={group.label}>
          {/* group row */}
          <div
            onClick={() => {
              setOpen(o => ({ ...o, [group.label]: !o[group.label] }));
              setNavSel(group.label);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 3,
              padding: "3px 4px 3px 4px", cursor: "default",
              background: navSel === group.label ? "#C8DDF0" : "transparent",
              border: navSel === group.label
                ? "1px solid #7BADDA" : "1px solid transparent",
            }}
            onMouseEnter={e => {
              if (navSel !== group.label)
                e.currentTarget.style.background = "#DBE9F7";
            }}
            onMouseLeave={e => {
              if (navSel !== group.label)
                e.currentTarget.style.background = "transparent";
            }}
          >
            {/* expand triangle */}
            <div style={{
              width: 12, height: 12, display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {group.items.length > 0 && (
                <svg width="7" height="7" viewBox="0 0 7 7">
                  {open[group.label]
                    ? <polygon points="0,1 7,1 3.5,6" fill="#666" />
                    : <polygon points="1,0 6,3.5 1,7" fill="#666" />
                  }
                </svg>
              )}
            </div>
            {group.icon}
            <span style={{
              fontSize: 12, color: "#1a1a1a",
              fontWeight: group.label === "Computer" ? 600 : 400,
            }}>{group.label}</span>
          </div>

          {/* children */}
          {open[group.label] && group.items.map(item => (
            <div
              key={item.label}
              onClick={() => setNavSel(item.label)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "2px 4px 2px 28px", cursor: "default",
                background: navSel === item.label ? "#C8DDF0" : "transparent",
                border: navSel === item.label
                  ? "1px solid #7BADDA" : "1px solid transparent",
                fontSize: 11.5,
              }}
              onMouseEnter={e => {
                if (navSel !== item.label)
                  e.currentTarget.style.background = "#DBE9F7";
              }}
              onMouseLeave={e => {
                if (navSel !== item.label)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {item.icon && item.icon}
              <span style={{ color: "#1a1a1a" }}>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "8px 10px 3px 10px", gap: 6,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 400, color: "#1F5FA6",
        fontFamily: "Segoe UI,Tahoma,sans-serif",
        whiteSpace: "nowrap",
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#BFCFE8" }} />
    </div>
  );
}

// ─── Capacity bar (exact Win7 style) ─────────────────────────────────────────
function CapBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(used / total, 1) : 0;
  const critical = pct > 0.89;
  const free = (total - used).toFixed(1);
  return (
    <div>
      <div style={{
        width: 160, height: 14,
        background: "#DCDCDC",
        border: "1px solid #A8A8A8",
        overflow: "hidden",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          width: `${pct * 100}%`, height: "100%",
          background: critical
            ? "linear-gradient(180deg,#F89050 0%,#E05010 48%,#C83000 50%,#E06020 100%)"
            : "linear-gradient(180deg,#70C0F0 0%,#2080D8 48%,#1060B8 50%,#4090E0 100%)",
        }} />
      </div>
      <div style={{
        fontSize: 10.5, color: "#444",
        fontFamily: "Segoe UI,Tahoma,sans-serif", marginTop: 2,
      }}>
        {free} GB free of {total} GB
      </div>
    </div>
  );
}

// ─── Drive tile ───────────────────────────────────────────────────────────────
type Drive = { icon: React.ReactNode; name: string; letter: string; used: number; total: number };

function DriveTile({ drive, selected, onClick }: {
  drive: Drive; selected: boolean; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const active = selected || hov;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "5px 12px", margin: "0 2px",
        background: selected ? "#CCE8FF" : hov ? "#E5F3FD" : "transparent",
        border: selected
          ? "1px solid #7DC2F4"
          : hov ? "1px solid #BDE0FA" : "1px solid transparent",
        cursor: "default", userSelect: "none",
      }}
    >
      <div style={{ flexShrink: 0, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {drive.icon}
      </div>
      <div>
        <div style={{
          fontSize: 12, fontFamily: "Segoe UI,Tahoma,sans-serif",
          color: "#1a1a1a", marginBottom: 5,
        }}>
          {drive.name} ({drive.letter}:)
        </div>
        {drive.total > 0 && <CapBar used={drive.used} total={drive.total} />}
        {drive.total === 0 && (
          <div style={{ fontSize: 10.5, color: "#888", fontFamily: "Segoe UI,Tahoma,sans-serif" }}>
            No media inserted
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Drives data ──────────────────────────────────────────────────────────────
const HDD_ICON = (
  <img src="/icons/computer.png" width={48} height={48} alt=""
    style={{ imageRendering: "pixelated", objectFit: "contain" }} />
);

// Simple flat DVD icon using CSS
const DVD_ICON = (
  <div style={{
    width: 46, height: 32, position: "relative",
    background: "linear-gradient(180deg,#f0f0f0 0%,#d8d8d8 100%)",
    border: "1px solid #a0a0a0", borderRadius: 2,
    display: "flex", alignItems: "center",
  }}>
    {/* slot */}
    <div style={{
      position: "absolute", left: 6, width: 24, height: 3,
      background: "#777", borderRadius: 1,
    }} />
    {/* led */}
    <div style={{
      position: "absolute", right: 6, width: 5, height: 5,
      borderRadius: "50%", background: "#00bb44",
      boxShadow: "0 0 3px #00ff66",
    }} />
    {/* eject */}
    <div style={{
      position: "absolute", right: 6, bottom: 5, width: 7, height: 7,
      background: "#ccc", border: "1px solid #aaa", borderRadius: 1,
    }} />
    <div style={{
      position: "absolute", bottom: 2, left: 6,
      fontSize: 6, color: "#888", fontFamily: "Arial, sans-serif", letterSpacing: 0.5,
    }}>DVD-RW</div>
  </div>
);

const NET_ICON = (
  <img src="/icons/internet.png" width={48} height={48} alt=""
    style={{ imageRendering: "pixelated", objectFit: "contain" }} />
);

const DRIVES: Drive[] = [
  { icon: HDD_ICON,  name: "Local Disk", letter: "C", used: 87,  total: 120 },
  { icon: DVD_ICON,  name: "DVD RW Drive", letter: "D", used: 0, total: 0  },
  { icon: NET_ICON,  name: "animesh's cloud", letter: "Z", used: 40, total: 100 },
];

const STATUS_INFO: Record<string, string> = {
  C: "Local Disk (C:)   ·   33.0 GB free of 120 GB",
  D: "DVD RW Drive (D:)   ·   No media inserted",
  Z: "Network Drive (Z:)   ·   60.0 GB free of 100 GB",
};

// ─── Content pane ─────────────────────────────────────────────────────────────
function ContentPane({ sel, setSel }: { sel: string; setSel: (s: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
      <SectionHeader label="Hard Disk Drives (1)" />
      <DriveTile drive={DRIVES[0]} selected={sel === "C"} onClick={() => setSel("C")} />

      <SectionHeader label="Devices with Removable Storage (1)" />
      <DriveTile drive={DRIVES[1]} selected={sel === "D"} onClick={() => setSel("D")} />

      <SectionHeader label="Network Locations (1)" />
      <DriveTile drive={DRIVES[2]} selected={sel === "Z"} onClick={() => setSel("Z")} />
    </div>
  );
}

// ─── Title bar ────────────────────────────────────────────────────────────────
function TitleBar({ onClose }: { onClose: () => void }) {
  const { onMinimize, onMaximize } = useWindowControls();
  return (
    <div className="title-bar">
      <div className="title-bar-text" style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <img src="/icons/computer.png" width={16} height={16} alt=""
          style={{ imageRendering: "pixelated" }} />
        Computer
      </div>
      <div className="title-bar-controls">
        <button aria-label="Minimize" onClick={onMinimize} />
        <button aria-label="Maximize" onClick={onMaximize} />
        <button aria-label="Close" onClick={onClose} />
      </div>
    </div>
  );
}

// ─── Status bar ───────────────────────────────────────────────────────────────
function StatusBar({ sel }: { sel: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 22, padding: "0 10px", flexShrink: 0,
      background: "linear-gradient(180deg,#f4f4f4 0%,#e8e8e8 100%)",
      borderTop: "1px solid #c0c0c0",
      fontSize: 11, fontFamily: "Segoe UI,Tahoma,sans-serif", color: "#444",
    }}>
      <span>{sel ? "1 item selected" : "3 items"}</span>
      {sel && <span>{STATUS_INFO[sel]}</span>}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function MyComputer({
  setIsWindowOpen, zIndex, onFocus, minimized, onMinimize,
}: {
  setIsWindowOpen: (v: boolean) => void;
  zIndex?: number; onFocus?: () => void;
  minimized?: boolean; onMinimize?: () => void;
}) {
  const handleClose = useCallback(() => setIsWindowOpen(false), [setIsWindowOpen]);
  const [navSel, setNavSel] = useState("Computer");
  const [driveSel, setDriveSel] = useState("C");

  return (
    <DraggableWindow
      cancelSelector=".computer-body"
      zIndex={zIndex}
      width="740px"
      height="510px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <TitleBar onClose={handleClose} />
      <AddressBar />
      <CommandBar />

      <div className="computer-body" style={{
        flex: 1, display: "flex", overflow: "hidden", minHeight: 0,
      }}>
        <NavPane navSel={navSel} setNavSel={setNavSel} />
        <ContentPane sel={driveSel} setSel={setDriveSel} />
      </div>

      <StatusBar sel={driveSel} />
    </DraggableWindow>
  );
}
