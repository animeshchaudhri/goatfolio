"use client";
import React, { useState, useCallback, useRef } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useDesktop } from "../Desktop/DesktopContext";
import { useWindowSize } from "../../hooks/useWindowSize";
import {
  EXPLORER_CANCEL, FONT, TitleBar, AddressBar, CommandBar, NavPane, SectionHeader, StatusBar,
  ExplorerBody, DetailsPane, itemStyle, type Command,
} from "../Win7/Chrome";
import { InlineDialog, Instruction } from "../Win7/FileView";
import { locationApp, openNavLocation } from "../Win7/Library";
import { EXPLORER_ICONS as E } from "../Win7/explorerIcons";
import "7.css/dist/7.css";
import { iconPath } from "../Desktop/apps";

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
        fontSize: 11, color: "#6d6d6d",
        fontFamily: FONT, marginTop: 2,
      }}>
        {free} GB free of {total} GB
      </div>
    </div>
  );
}

// ─── Drive tile ───────────────────────────────────────────────────────────────
type Drive = {
  icon: React.ReactNode; name: string; letter: string; used: number; total: number;
  kind: "Local Disk" | "CD Drive" | "Network Drive";
  /** Explorer location opened by a double-click */
  location: string;
  /** Text under the name when there is no capacity bar */
  note?: string;
};

function DriveTile({ drive, selected, onClick }: {
  drive: Drive; selected: boolean; onClick: (e: React.MouseEvent) => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10, verticalAlign: "top",
        width: 252, boxSizing: "border-box",
        padding: "5px 8px", margin: "1px 4px", borderRadius: 3,
        ...itemStyle(selected, hov),
        cursor: "default", userSelect: "none",
      }}
    >
      <div style={{ flexShrink: 0, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {drive.icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontFamily: FONT,
          color: "#1a1a1a", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {drive.name} ({drive.letter}:)
        </div>
        {drive.total > 0 ? <CapBar used={drive.used} total={drive.total} /> : (
          <div style={{ fontSize: 11, color: "#6d6d6d", fontFamily: FONT }}>
            {drive.note ?? "No media inserted"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Drives data ──────────────────────────────────────────────────────────────
const driveIcon = (src: string) => <img src={iconPath(src, 48)} width={48} height={48} alt="" style={{ objectFit: "contain" }} />;
const HDD_ICON = driveIcon(E.systemDrive);
const DVD_ICON = driveIcon(E.dvdDrive);
const NET_ICON = driveIcon(E.networkDrive);

const DRIVES: Drive[] = [
  { icon: HDD_ICON, name: "Local Disk",      letter: "C", used: 87, total: 120, kind: "Local Disk",    location: "Local Disk (C:)" },
  { icon: DVD_ICON, name: "DVD RW Drive",    letter: "D", used: 0,  total: 0,   kind: "CD Drive",      location: "DVD RW Drive (D:)" },
  { icon: NET_ICON, name: "animesh's cloud", letter: "Z", used: 40, total: 100, kind: "Network Drive", location: "animesh's cloud (Z:)" },
];

// ─── Content pane ─────────────────────────────────────────────────────────────
function ContentPane({ drives, sel, onClickDrive, onClear }: {
  drives: Drive[]; sel: string; onClickDrive: (e: React.MouseEvent, d: Drive) => void; onClear: () => void;
}) {
  const groups: [string, Drive[]][] = [
    ["Hard Disk Drives", drives.filter((d) => d.kind === "Local Disk")],
    ["Devices with Removable Storage", drives.filter((d) => d.kind === "CD Drive")],
    ["Network Locations", drives.filter((d) => d.kind === "Network Drive")],
  ];
  return (
    <div onClick={onClear} style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
      {groups.map(([label, list]) => (
        <React.Fragment key={label}>
          <SectionHeader label={`${label} (${list.length})`} />
          {list.map((d) => (
            <DriveTile key={d.letter} drive={d} selected={sel === d.letter} onClick={(e) => onClickDrive(e, d)} />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Drive properties (General tab with the Win7 used/free pie) ───────────────
function DriveProperties({ drive, onClose }: { drive: Drive; onClose: () => void }) {
  const free = drive.total - drive.used;
  const gb = (n: number) => `${n.toFixed(1)} GB`;
  const bytes = (n: number) => `${Math.round(n * 1073741824).toLocaleString("en-US")} bytes`;
  const pct = drive.total ? drive.used / drive.total : 0;
  const row = (swatch: string | null, k: string, b: string, g: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "16px 82px 1fr 58px", alignItems: "center", gap: 4, marginBottom: 4 }}>
      {swatch ? <div style={{ width: 12, height: 12, background: swatch, border: "1px solid #555" }} /> : <span />}
      <span>{k}</span><span style={{ textAlign: "right" }}>{b}</span><span style={{ textAlign: "right" }}>{g}</span>
    </div>
  );
  return (
    <InlineDialog
      title={`${drive.name} (${drive.letter}:) Properties`}
      onClose={onClose}
      width={410}
      footer={<>
        <button onClick={onClose}>OK</button>
        <button onClick={onClose}>Cancel</button>
        <button disabled>Apply</button>
      </>}
    >
      <menu role="tablist" style={{ margin: "-4px 0 0" }}>
        <button role="tab" aria-selected>General</button>
      </menu>
      <article role="tabpanel" style={{ padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{ transform: "scale(0.75)", transformOrigin: "left center", width: 36 }}>{drive.icon}</div>
          <input type="text" readOnly value={drive.name} style={{ flex: 1 }} />
        </div>
        <div style={{ borderTop: "1px solid #d5d5d5", paddingTop: 8, marginBottom: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "106px 1fr", rowGap: 3 }}>
            <span>Type:</span><span>{drive.kind}</span>
            <span>File system:</span><span>{drive.total ? "NTFS" : "—"}</span>
          </div>
        </div>
        {drive.total > 0 ? (
          <>
            <div style={{ borderTop: "1px solid #d5d5d5", paddingTop: 8 }}>
              {row("#3a7bd5", "Used space:", bytes(drive.used), gb(drive.used))}
              {row("#e64ad6", "Free space:", bytes(free), gb(free))}
            </div>
            <div style={{ borderTop: "1px solid #d5d5d5", paddingTop: 6 }}>
              {row(null, "Capacity:", bytes(drive.total), `${drive.total} GB`)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 8 }}>
              <div style={{
                width: 96, height: 56, borderRadius: "50%", border: "1px solid #555",
                background: `conic-gradient(from 90deg,#3a7bd5 0 ${pct * 360}deg,#e64ad6 ${pct * 360}deg 360deg)`,
                boxShadow: "0 6px 0 -1px #7a3d74, 0 6px 0 0 #555",
              }} />
              <span>Drive {drive.letter}:</span>
            </div>
          </>
        ) : (
          <div style={{ borderTop: "1px solid #d5d5d5", paddingTop: 10, color: "#5a677c" }}>
            {drive.note ?? "No media inserted."}
          </div>
        )}
      </article>
    </InlineDialog>
  );
}

// ─── Map Network Drive wizard ─────────────────────────────────────────────────
function MapDriveWizard({ used, onClose, onFinish }: {
  used: string[]; onClose: () => void; onFinish: (letter: string, folder: string) => void;
}) {
  const letters = ["Y", "X", "W", "V", "U", "T"].filter((l) => !used.includes(l));
  const [letter, setLetter] = useState(letters[0] ?? "T");
  const [folder, setFolder] = useState("");
  const valid = /^\\\\[^\\]+\\[^\\]+/.test(folder);
  return (
    <InlineDialog
      title="Map Network Drive"
      icon={E.networkDrive}
      onClose={onClose}
      footer={<>
        <button disabled={!valid} onClick={() => onFinish(letter, folder)}>Finish</button>
        <button onClick={onClose}>Cancel</button>
      </>}
    >
      <Instruction>What network folder would you like to map?</Instruction>
      <div style={{ marginBottom: 12 }}>Specify the drive letter for the connection and the folder that you want to connect to:</div>
      <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", alignItems: "center", rowGap: 8, columnGap: 8 }}>
        <label htmlFor="mnd-drive">Drive:</label>
        <select id="mnd-drive" value={letter} onChange={(e) => setLetter(e.target.value)} style={{ width: 70 }}>
          {letters.map((l) => <option key={l} value={l}>{l}:</option>)}
        </select>
        <label htmlFor="mnd-folder">Folder:</label>
        <input id="mnd-folder" type="text" value={folder} placeholder="\\server\share"
          onChange={(e) => setFolder(e.target.value)} />
        <span />
        <span style={{ color: "#5a677c" }}>Example: \\server\share</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <input type="checkbox" id="mnd-reconnect" defaultChecked /><label htmlFor="mnd-reconnect">Reconnect at logon</label>
      </div>
    </InlineDialog>
  );
}

const STATUS_INFO: Record<string, string> = {
  C: "Local Disk (C:)   ·   33.0 GB free of 120 GB",
  D: "DVD RW Drive (D:)   ·   No media inserted",
  Z: "Network Drive (Z:)   ·   60.0 GB free of 100 GB",
};

// ─── Root export ──────────────────────────────────────────────────────────────
export default function MyComputer({
  setIsWindowOpen, zIndex, onFocus, minimized, onMinimize,
}: {
  setIsWindowOpen: (v: boolean) => void;
  zIndex?: number; onFocus?: () => void;
  minimized?: boolean; onMinimize?: () => void;
}) {
  const handleClose = useCallback(() => setIsWindowOpen(false), [setIsWindowOpen]);
  const { openApp } = useDesktop();
  const small = useWindowSize();
  const [driveSel, setDriveSel] = useState("");
  const [mapped, setMapped] = useState<Drive[]>([]);
  const [dialog, setDialog] = useState<"map" | "props" | null>(null);
  const [showNav, setShowNav] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const last = useRef<{ letter: string; t: number } | null>(null);

  const drives = [...DRIVES, ...mapped];
  const drive = drives.find((d) => d.letter === driveSel) ?? null;

  // Two clicks/taps within 450ms on the same drive = double-click → open it
  const clickDrive = (e: React.MouseEvent, d: Drive) => {
    e.stopPropagation();
    const now = Date.now();
    if (last.current?.letter === d.letter && now - last.current.t < 450) {
      last.current = null;
      openApp(locationApp(d.location));
    } else {
      last.current = { letter: d.letter, t: now };
      setDriveSel(d.letter);
    }
  };

  const mapDrive = (letter: string, folder: string) => {
    const [, server, share] = folder.match(/^\\\\([^\\]+)\\([^\\]+)/) ?? [];
    const name = `${share} (\\\\${server})`;
    setMapped((m) => [...m, {
      icon: NET_ICON, name, letter, used: 0, total: 0, kind: "Network Drive",
      location: `${name} (${letter}:)`, note: "Disconnected Network Drive",
    }]);
    setDialog(null);
    setDriveSel(letter);
  };

  const commands: Command[] = [
    {
      label: "Organize",
      menu: [
        { label: "Cut", disabled: true }, { label: "Copy", disabled: true }, { label: "Paste", disabled: true },
        { label: "Undo", disabled: true }, { label: "Redo", disabled: true, divider: true },
        { label: "Details pane", checked: showDetails, onClick: () => setShowDetails((v) => !v) },
        { label: "Navigation pane", checked: showNav, onClick: () => setShowNav((v) => !v), divider: true },
        { label: "Properties", disabled: !drive, onClick: () => setDialog("props") },
        { label: "Close", onClick: handleClose },
      ],
    },
    ...(drive ? [
      { label: "Open", onClick: () => openApp(locationApp(drive.location)) },
      { label: "Properties", onClick: () => setDialog("props") },
    ] : [
      { label: "System properties", onClick: () => openApp("Control Panel") },
      { label: "Uninstall or change a program", onClick: () => openApp("Default Programs") },
    ]),
    { label: "Map network drive", onClick: () => setDialog("map") },
    { label: "Open Control Panel", onClick: () => openApp("Control Panel") },
  ];

  return (
    <DraggableWindow
      cancelSelector={EXPLORER_CANCEL}
      zIndex={zIndex}
      width="760px"
      height="520px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <TitleBar title="" onClose={handleClose} />
      <AddressBar
        icon={E.computer}
        path={["Computer"]}
        searchPlaceholder={small ? undefined : "Search Computer"}
        onCrumb={(i) => i < 0 && openApp(locationApp("Desktop"))}
      />
      <ExplorerBody>
        <CommandBar commands={commands} showViews={false} />

        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          {showNav && !small && (
            <NavPane navSel="Computer" onSelect={(label) => label !== "Computer" && openNavLocation(openApp, label)} />
          )}
          <ContentPane drives={drives} sel={driveSel} onClickDrive={clickDrive} onClear={() => setDriveSel("")} />
        </div>

        {showDetails && (drive ? (
          <DetailsPane
            icon={drive.icon}
            title={`${drive.name} (${drive.letter}:)`}
            subtitle={drive.kind}
            props={small || !drive.total ? [] : [
              ["Space used:", `${drive.used.toFixed(1)} GB`], ["Total size:", `${drive.total} GB`],
              ["Space free:", `${(drive.total - drive.used).toFixed(1)} GB`], ["File system:", "NTFS"],
            ]}
          />
        ) : (
          <DetailsPane
            icon={<img src={iconPath(E.computer, 48)} width={48} height={48} alt="" />}
            title="ANIMESH-PC"
            props={small ? [] : [
              ["Workgroup:", "WORKGROUP"], ["Memory:", "16.0 GB"],
              ["Processor:", "Intel(R) Core(TM) i7-2600 CPU @ 3.40GHz"],
            ]}
          />
        ))}
        <StatusBar
          left={drive ? "1 item selected" : `${drives.length} items`}
          right={drive ? STATUS_INFO[drive.letter] ?? `${drive.name} (${drive.letter}:)` : undefined}
        />

        {dialog === "map" && (
          <MapDriveWizard used={drives.map((d) => d.letter)} onClose={() => setDialog(null)} onFinish={mapDrive} />
        )}
        {dialog === "props" && drive && <DriveProperties drive={drive} onClose={() => setDialog(null)} />}
      </ExplorerBody>
    </DraggableWindow>
  );
}
