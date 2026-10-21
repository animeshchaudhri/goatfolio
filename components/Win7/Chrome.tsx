"use client";
import React, { useEffect, useRef, useState } from "react";
import { useWindowControls } from "../DraggableWindow/WindowContext";
import { useDesktop } from "../Desktop/DesktopContext";
import { EXPLORER_ICONS as ICONS } from "./explorerIcons";
import "7.css/dist/7.css";
import { iconPath } from "../Desktop/apps";

// Shared Windows 7 Explorer chrome: title bar, glass address bar, command bar, nav pane,
// details pane, status bar, dropdown menus.

export const FONT = "Segoe UI,Tahoma,sans-serif";

/** Drag-cancel selector for Explorer windows: everything interactive below the title bar */
export const EXPLORER_CANCEL = ".win7-explorer-body, .win7-nav-btn, .win7-addr-crumbs, .win7-addr-search";

// Win7 list-item states (Explorer, nav pane, menus)
export const ITEM_HOVER = { background: "linear-gradient(180deg,#fafbfd 0%,#ebf3fd 100%)", border: "1px solid #b8d6fb" };
export const ITEM_SELECTED = { background: "linear-gradient(180deg,#dcebfc 0%,#c1dbfc 100%)", border: "1px solid #7da2ce" };
export const ITEM_SELECTED_HOVER = { background: "linear-gradient(180deg,#e5f1fd 0%,#c9e0fc 100%)", border: "1px solid #7da2ce" };

export function itemStyle(selected: boolean, hovered: boolean): React.CSSProperties {
  if (selected) return hovered ? ITEM_SELECTED_HOVER : ITEM_SELECTED;
  if (hovered) return ITEM_HOVER;
  return { background: "transparent", border: "1px solid transparent" };
}

// ─── Sprite icon (matches Filenavbar positions) ───────────────────────────────
export type SpriteName = "chevron-left" | "chevron-right" | "chevron-down" | "chevron-up" | "folder" | "chevron-small-right";

const SPRITE: Record<SpriteName, { pos: string; w: number; h: number }> = {
  "chevron-left":        { pos: "0px 0px",     w: 24, h: 24 },
  "chevron-right":       { pos: "-64px 0px",   w: 24, h: 24 },
  "chevron-down":        { pos: "-84px -24px", w: 18, h: 18 },
  "chevron-up":          { pos: "0px -24px",   w: 24, h: 18 },
  "folder":              { pos: "-72px -96px", w: 24, h: 24 },
  "chevron-small-right": { pos: "-48px -24px", w: 16, h: 16 },
};

export function Sp({ name, size = 16 }: { name: SpriteName; size?: number }) {
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

// ─── Title bar ────────────────────────────────────────────────────────────────
// Explorer windows pass title="" — Win7 Explorer shows no caption, the address bar says where you are.
export function TitleBar({ title, icon, onClose, controls = "full" }: {
  title: string;
  icon?: string;
  onClose: () => void;
  /** "full" = min/max/close (app windows), "close" = close only (dialogs) */
  controls?: "full" | "close";
}) {
  const { onMinimize, onMaximize } = useWindowControls();
  return (
    <div className="title-bar">
      <div className="title-bar-text" style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {icon && (
          <img src={iconPath(icon, 16)} width={16} height={16} alt=""
            style={{ imageRendering: "pixelated" }} />
        )}
        {title}
      </div>
      <div className="title-bar-controls">
        {controls === "full" && <button aria-label="Minimize" onClick={onMinimize} />}
        {controls === "full" && <button aria-label="Maximize" onClick={onMaximize} />}
        <button aria-label="Close" onClick={onClose} />
      </div>
    </div>
  );
}

// ─── Win7 circular nav button ─────────────────────────────────────────────────
export function NavBtn({ dir, disabled, onClick }: { dir: "back" | "fwd"; disabled?: boolean; onClick?: () => void }) {
  const [h, setH] = useState(false);
  return (
    <div
      className="win7-nav-btn"
      title={disabled ? undefined : dir === "back" ? "Back" : "Forward"}
      onMouseEnter={() => !disabled && setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={disabled ? undefined : onClick}
      style={{
        width: 23, height: 23, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.75 : 1,
        background: disabled
          ? "linear-gradient(180deg,#e3e9f1 0%,#bccbdc 100%)"
          : h
          ? "linear-gradient(180deg,#6ec6f5 0%,#228bd0 50%,#1470b8 100%)"
          : "linear-gradient(180deg,#55b8f0 0%,#1a80c8 50%,#1060b0 100%)",
        border: `1px solid ${disabled ? "#8a9bb3" : h ? "#0a58b0" : "#1060a8"}`,
        boxShadow: disabled ? "inset 0 1px 0 rgba(255,255,255,0.5)" : h
          ? "0 1px 4px rgba(0,80,200,0.5),inset 0 1px 0 rgba(255,255,255,0.35)"
          : "0 1px 3px rgba(0,60,160,0.4),inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <Sp name={dir === "back" ? "chevron-left" : "chevron-right"} size={14} />
    </div>
  );
}

// Breadcrumb separator: Win7's small black ▸
function CrumbArrow() {
  return (
    <svg width="13" height="18" viewBox="0 0 13 18" style={{ flexShrink: 0 }}>
      <path d="M5 6l4 3-4 3z" fill="#2b2b2b" />
    </svg>
  );
}

// ─── Address bar (sits on the Aero glass frame) ───────────────────────────────
export function AddressBar({ icon, path, searchPlaceholder, onBack, onForward, search, onSearch, onCrumb, onRefresh }: {
  icon: string;
  /** Breadcrumb segments, e.g. ["Libraries", "Documents"] */
  path: string[];
  searchPlaceholder?: string;
  onBack?: () => void;
  onForward?: () => void;
  /** Controlled search text; omit both search props for a static placeholder box */
  search?: string;
  onSearch?: (v: string) => void;
  /** Click on breadcrumb segment `index` (-1 = the leading icon) */
  onCrumb?: (index: number) => void;
  /** Shows the refresh button at the end of the address box */
  onRefresh?: () => void;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const crumbStyle = (i: number): React.CSSProperties => ({
    display: "flex", alignItems: "center", height: 18, padding: "0 3px",
    borderRadius: 2, cursor: onCrumb ? "pointer" : "default",
    border: hov === i && onCrumb ? "1px solid rgba(60,110,170,0.55)" : "1px solid transparent",
    background: hov === i && onCrumb ? "linear-gradient(180deg,#f3f8fd 0%,#d6e8f9 100%)" : "transparent",
  });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 3,
      padding: "3px 6px 4px 5px", height: 34, flexShrink: 0,
      background: "transparent",
    }}>
      <NavBtn dir="back" disabled={!onBack} onClick={onBack} />
      <div style={{ width: 2 }} />
      <NavBtn dir="fwd" disabled={!onForward} onClick={onForward} />
      <div style={{
        width: 14, height: 14, display: "flex", alignItems: "center",
        justifyContent: "center", marginLeft: 1, opacity: 0.8,
      }}>
        <Sp name="chevron-down" size={12} />
      </div>

      {/* breadcrumb */}
      <div className="win7-addr-crumbs" style={{
        flex: 1, minWidth: 0, height: 24,
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(40,60,90,0.55)",
        display: "flex", alignItems: "center",
        padding: "0 0 0 4px", gap: 0,
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.45)",
        borderRadius: 2, overflow: "hidden",
      }}>
        <div style={crumbStyle(-1)} onMouseEnter={() => setHov(-1)} onMouseLeave={() => setHov(null)} onClick={() => onCrumb?.(-1)}>
          <img src={iconPath(icon, 16)} width={16} height={16}
            alt="" style={{ imageRendering: "pixelated" }} />
        </div>
        {path.map((seg, i) => (
          <React.Fragment key={seg + i}>
            <CrumbArrow />
            <span
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onCrumb?.(i)}
              style={{
                ...crumbStyle(i),
                fontSize: 12, fontFamily: FONT,
                color: "#1a1a1a", whiteSpace: "nowrap",
              }}
            >{seg}</span>
          </React.Fragment>
        ))}
        <CrumbArrow />
        <div style={{ flex: 1 }} />
        {onRefresh && (
          <div
            title="Refresh"
            onClick={onRefresh}
            onMouseEnter={() => setHov(-2)}
            onMouseLeave={() => setHov(null)}
            style={{
              width: 22, height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              borderLeft: "1px solid #c7d3e2", cursor: "pointer", flexShrink: 0,
              background: hov === -2 ? "linear-gradient(180deg,#f3f8fd 0%,#d6e8f9 100%)" : "transparent",
            }}
          >
            <img src={ICONS.refresh} width={14} height={14} alt="" />
          </div>
        )}
      </div>

      {/* search */}
      {searchPlaceholder && (
        <div className="win7-addr-search" style={{
          width: 182, height: 24, flexShrink: 0, marginLeft: 3,
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(40,60,90,0.55)",
          display: "flex", alignItems: "center",
          padding: "0 5px", gap: 3,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.45)",
          borderRadius: 2,
        }}>
          {onSearch ? (
            <input
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                all: "unset", flex: 1, minWidth: 0,
                fontSize: 12, fontFamily: FONT, color: "#1a1a1a",
                fontStyle: search ? "normal" : "italic",
              }}
            />
          ) : (
            <span style={{
              flex: 1, fontSize: 12, fontFamily: FONT, color: "#8b8b8b",
              fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden",
            }}>{searchPlaceholder}</span>
          )}
          {search ? (
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, cursor: "pointer" }}
              onClick={() => onSearch?.("")}>
              <path d="M3 3l6 6M9 3l-6 6" stroke="#666" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <img src={ICONS.search} width={13} height={13} alt="" style={{ flexShrink: 0 }} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dropdown menu (Win7 context-menu look) ───────────────────────────────────
export type MenuItem = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Shows a check mark (checkbox items) */
  checked?: boolean;
  /** Shows a bullet (radio items, e.g. the current view) */
  radio?: boolean;
  bold?: boolean;
  /** Draws a separator line below this item */
  divider?: boolean;
};

export function Menu({ items, onClose, style }: { items: MenuItem[]; onClose: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState<number | null>(null);

  useEffect(() => {
    const away = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <div ref={ref} role="menu" style={{
      position: "absolute", zIndex: 50, minWidth: 180, padding: 2,
      background: "#f0f0f0", border: "1px solid #979797",
      boxShadow: "3px 3px 4px -1px rgba(0,0,0,0.35)",
      fontFamily: FONT, fontSize: 12, color: "#000", userSelect: "none",
      ...style,
    }}>
      {/* icon gutter */}
      <div style={{
        position: "absolute", left: 28, top: 2, bottom: 2, width: 2, pointerEvents: "none",
        boxShadow: "inset 1px 0 #e2e3e3, inset -1px 0 #fff",
      }} />
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          <div
            role="menuitem"
            aria-disabled={it.disabled || undefined}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            onClick={() => { if (it.disabled) return; onClose(); it.onClick?.(); }}
            style={{
              position: "relative", height: 22, display: "flex", alignItems: "center",
              padding: "0 20px 0 33px", borderRadius: 3, whiteSpace: "nowrap", cursor: "default",
              color: it.disabled ? "#6d6d6d" : "#000", fontWeight: it.bold ? 700 : 400,
              border: hov === i ? `1px solid ${it.disabled ? "#d9d9d9" : "#aecff7"}` : "1px solid transparent",
              background: hov === i
                ? it.disabled ? "rgba(230,230,230,0.6)" : "linear-gradient(180deg,#f3f7fd 0%,#e1ebf9 100%)"
                : "transparent",
            }}
          >
            {it.checked && (
              <svg width="12" height="12" viewBox="0 0 12 12" style={{ position: "absolute", left: 8 }}>
                <path d="M2 6.5l2.6 2.6L10 3.5" stroke="#0c12a1" strokeWidth="1.6" fill="none" />
              </svg>
            )}
            {it.radio && (
              <div style={{
                position: "absolute", left: 10, width: 7, height: 7, borderRadius: "50%",
                background: "radial-gradient(circle at 70% 30%,#d5d4ea,#333583)", border: "1px solid #1a1490",
              }} />
            )}
            {it.label}
          </div>
          {it.divider && (
            <div style={{ height: 1, margin: "3px 1px 3px 31px", background: "#e0e0e0", borderBottom: "1px solid #fff" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Command bar ─────────────────────────────────────────────────────────────
export type Command = {
  label: string;
  arrow?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** Dropdown items; implies the ▾ arrow */
  menu?: MenuItem[];
};

export type ViewMode = "large" | "medium" | "small" | "list" | "details" | "tiles";

const VIEW_LABELS: [ViewMode, string][] = [
  ["large", "Large icons"], ["medium", "Medium icons"], ["small", "Small icons"],
  ["list", "List"], ["details", "Details"], ["tiles", "Tiles"],
];

const VIEW_CYCLE: ViewMode[] = ["large", "list", "details", "tiles", "medium"];

export function CommandBar({ commands, showViews = true, view, onViewChange, showHelp = true }: {
  commands: Command[];
  showViews?: boolean;
  /** Current view; the "Change your view" button appears when onViewChange is given */
  view?: ViewMode;
  onViewChange?: (v: ViewMode) => void;
  showHelp?: boolean;
}) {
  const { openApp } = useDesktop();
  const [hov, setHov] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const btn = (key: string, disabled?: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 3, height: 24, flexShrink: 0,
    borderRadius: 3, cursor: "default", position: "relative",
    border: (hov === key || open === key) && !disabled ? "1px solid #7a9ccc" : "1px solid transparent",
    background: open === key && !disabled
      ? "linear-gradient(180deg,#c9dcf3 0%,#b2cdee 100%)"
      : hov === key && !disabled
      ? "linear-gradient(180deg,#fdfeff 0%,#e1ecfa 100%)"
      : "transparent",
    boxShadow: hov === key && !disabled ? "inset 0 0 0 1px rgba(255,255,255,0.7)" : "none",
  });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 1,
      height: 31, padding: "0 6px",
      background: "linear-gradient(180deg,#fcfdfe 0%,#f0f4fa 46%,#e4ecf7 54%,#dfe8f5 100%)",
      borderBottom: "1px solid #a0afc3",
      boxShadow: "inset 0 1px 0 #fff",
      userSelect: "none", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, overflow: "hidden" }}>
        {commands.map((cmd) => (
          <div
            key={cmd.label}
            onMouseEnter={() => setHov(cmd.label)}
            onMouseLeave={() => setHov(null)}
            onClick={cmd.disabled ? undefined : cmd.menu ? () => setOpen(open === cmd.label ? null : cmd.label) : cmd.onClick}
            style={{
              ...btn(cmd.label, cmd.disabled),
              padding: "0 8px",
              fontSize: 12, fontFamily: FONT,
              color: cmd.disabled ? "#8e9bae" : "#1e395b",
              whiteSpace: "nowrap",
            }}
          >
            {cmd.label}
            {(cmd.arrow || cmd.menu) && (
              <svg width="7" height="4" viewBox="0 0 7 4" style={{ marginLeft: 2 }}>
                <path d="M0 0h7L3.5 4z" fill={cmd.disabled ? "#8e9bae" : "#1e395b"} />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Dropdowns render outside the overflow-clipped row */}
      {commands.map((cmd) => cmd.menu && open === cmd.label && (
        <CommandMenu key={cmd.label} anchor={cmd.label} items={cmd.menu} onClose={() => setOpen(null)} />
      ))}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 2, position: "relative", flexShrink: 0 }}>
        {showViews && onViewChange && (
          <>
            <div
              title="Change your view"
              onMouseEnter={() => setHov("__views")}
              onMouseLeave={() => setHov(null)}
              onClick={() => onViewChange(VIEW_CYCLE[(VIEW_CYCLE.indexOf(view ?? "large") + 1) % VIEW_CYCLE.length])}
              style={{ ...btn("__views"), width: 26, justifyContent: "center", borderRadius: "3px 0 0 3px" }}
            >
              <img src={ICONS.views} width={16} height={16} alt="" />
            </div>
            <div
              title="More options"
              onMouseEnter={() => setHov("__viewsmenu")}
              onMouseLeave={() => setHov(null)}
              onClick={() => setOpen(open === "__viewsmenu" ? null : "__viewsmenu")}
              style={{ ...btn("__viewsmenu"), width: 13, justifyContent: "center", borderRadius: "0 3px 3px 0", marginLeft: -2 }}
            >
              <svg width="7" height="4" viewBox="0 0 7 4"><path d="M0 0h7L3.5 4z" fill="#1e395b" /></svg>
            </div>
            {open === "__viewsmenu" && (
              <Menu
                onClose={() => setOpen(null)}
                style={{ top: 27, right: 26, minWidth: 160 }}
                items={VIEW_LABELS.map(([v, label]) => ({ label, radio: v === view, onClick: () => onViewChange(v) }))}
              />
            )}
          </>
        )}
        {showHelp && (
          <div
            title="Get help"
            onMouseEnter={() => setHov("__help")}
            onMouseLeave={() => setHov(null)}
            onClick={() => openApp("Help and Support")}
            style={{ ...btn("__help"), width: 26, justifyContent: "center" }}
          >
            <img src={iconPath(ICONS.help, 16)} width={16} height={16} alt="" />
          </div>
        )}
      </div>
    </div>
  );
}

// Positions a dropdown under its command button (measured from the DOM at open time)
function CommandMenu({ anchor, items, onClose }: { anchor: string; items: MenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const bar = ref.current?.parentElement;
    const btnEl = bar && [...bar.querySelectorAll<HTMLElement>("div")].find((d) => d.firstChild?.textContent === anchor);
    if (bar && btnEl) setLeft(btnEl.getBoundingClientRect().left - bar.getBoundingClientRect().left);
  }, [anchor]);
  return (
    <div ref={ref} style={{ position: "absolute", left, top: 0 }}>
      <Menu items={items} onClose={onClose} style={{ top: 28, left: 0 }} />
    </div>
  );
}

// ─── Nav pane ─────────────────────────────────────────────────────────────────
type TreeItem = { label: string; icon?: React.ReactNode };
type TreeGroup = {
  label: string; icon: React.ReactNode;
  items: TreeItem[]; defaultOpen?: boolean;
};

const NAV_ICON = (src: string) => <img src={iconPath(src, 16)} width={16} height={16} alt="" style={{ flexShrink: 0 }} />;

export const DRIVE_ICON_16 = NAV_ICON(ICONS.localDisk);
export const DISC_ICON_16 = NAV_ICON(ICONS.dvdDrive);

const TREE: TreeGroup[] = [
  {
    label: "Favorites", icon: NAV_ICON(ICONS.favorites),
    defaultOpen: true,
    items: [
      { label: "Desktop",       icon: NAV_ICON(ICONS.desktop) },
      { label: "Downloads",     icon: NAV_ICON(ICONS.downloads) },
      { label: "Recent Places", icon: NAV_ICON(ICONS.recentPlaces) },
    ],
  },
  {
    label: "Libraries", icon: NAV_ICON(ICONS.libraries),
    defaultOpen: true,
    items: [
      { label: "Documents", icon: NAV_ICON(ICONS.documents) },
      { label: "Music",     icon: NAV_ICON(ICONS.music) },
      { label: "Pictures",  icon: NAV_ICON(ICONS.pictures) },
      { label: "Videos",    icon: NAV_ICON(ICONS.videos) },
    ],
  },
  {
    label: "Computer", icon: NAV_ICON(ICONS.computer),
    defaultOpen: true,
    items: [
      { label: "Local Disk (C:)",   icon: DRIVE_ICON_16 },
      { label: "DVD RW Drive (D:)", icon: DISC_ICON_16 },
    ],
  },
  {
    label: "Network", icon: NAV_ICON(ICONS.network),
    defaultOpen: false,
    items: [],
  },
];

export function NavPane({ navSel, onSelect }: { navSel: string; onSelect: (label: string) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(TREE.map(g => [g.label, g.defaultOpen ?? false]))
  );
  const [hov, setHov] = useState<string | null>(null);
  const [paneHover, setPaneHover] = useState(false);

  const row = (label: string, indent: number): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 5, height: 22,
    padding: `0 4px 0 ${indent}px`, margin: "0 2px", cursor: "default", borderRadius: 2,
    ...itemStyle(navSel === label, hov === label),
  });

  return (
    <div
      className="win7-navpane"
      onMouseEnter={() => setPaneHover(true)}
      onMouseLeave={() => setPaneHover(false)}
      style={{
        width: 180, flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #d6e0ea",
        overflowY: "auto", overflowX: "hidden",
        fontFamily: FONT,
        fontSize: 12, userSelect: "none",
        padding: "6px 0",
      }}
    >
      {TREE.map(group => (
        <div key={group.label} style={{ marginBottom: 12 }}>
          <div
            onMouseEnter={() => setHov(group.label)}
            onMouseLeave={() => setHov(null)}
            onClick={() => onSelect(group.label)}
            style={row(group.label, 2)}
          >
            {/* Win7 expander: hollow ▷ collapsed, filled ◢ expanded; fades in on pane hover */}
            <div
              onClick={(e) => { e.stopPropagation(); setOpen(o => ({ ...o, [group.label]: !o[group.label] })); }}
              style={{
                width: 14, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, opacity: paneHover ? 1 : 0, transition: "opacity 0.25s",
              }}
            >
              {group.items.length > 0 && (
                <svg width="8" height="8" viewBox="0 0 8 8">
                  {open[group.label]
                    ? <polygon points="7,1 7,7 1,7" fill="#595959" />
                    : <polygon points="2,0.5 6.5,4 2,7.5" fill="none" stroke="#a6a6a6" strokeWidth="1" />
                  }
                </svg>
              )}
            </div>
            {group.icon}
            <span style={{ color: "#1a1a1a", whiteSpace: "nowrap" }}>{group.label}</span>
          </div>

          {open[group.label] && group.items.map(item => (
            <div
              key={item.label}
              onMouseEnter={() => setHov(item.label)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onSelect(item.label)}
              style={row(item.label, 33)}
            >
              {item.icon && item.icon}
              <span style={{ color: "#1a1a1a", whiteSpace: "nowrap" }}>{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "8px 10px 3px 10px", gap: 6,
    }}>
      <span style={{
        fontSize: 12, fontWeight: 400, color: "#1e3287",
        fontFamily: FONT,
        whiteSpace: "nowrap",
      }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#c4d0e2 0%,#e8edf4 70%,rgba(232,237,244,0) 100%)" }} />
    </div>
  );
}

// ─── Explorer body: the white client area inset in the glass frame ────────────
export function ExplorerBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="win7-explorer-body" style={{
      flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
      margin: "0 6px 6px", background: "#fff",
      border: "1px solid rgba(0,0,0,0.6)",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.55)",
      overflow: "hidden", position: "relative",
    }}>
      {children}
    </div>
  );
}

// ─── Details pane (bottom of Explorer) ────────────────────────────────────────
export function DetailsPane({ icon, title, subtitle, props = [] }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Property rows, e.g. [["Date modified:", "7/8/2026 9:17 PM"], ["Size:", "628 KB"]] */
  props?: [string, string][];
}) {
  const half = Math.ceil(props.length / 2);
  const col = (rows: [string, string][]) => (
    <div style={{ display: "grid", gridTemplateColumns: "auto auto", columnGap: 6, rowGap: 1, alignContent: "start" }}>
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <span style={{ color: "#5a677c", textAlign: "right", whiteSpace: "nowrap" }}>{k}</span>
          <span style={{ color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</span>
        </React.Fragment>
      ))}
    </div>
  );
  return (
    <div className="win7-details-pane" style={{
      display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      minHeight: 62, padding: "6px 14px",
      background: "linear-gradient(180deg,#f8fafd 0%,#eef3fa 100%)",
      borderTop: "1px solid #c5d3e6",
      fontFamily: FONT, fontSize: 12, overflow: "hidden",
    }}>
      <div style={{ width: 48, height: 48, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flexShrink: 0, maxWidth: 220 }}>
        <div style={{ color: "#1a1a1a", fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {subtitle && <div style={{ color: "#5a677c", whiteSpace: "nowrap" }}>{subtitle}</div>}
      </div>
      {props.length > 0 && (
        <div className="win7-details-props" style={{ display: "flex", gap: 24, minWidth: 0, marginLeft: 8 }}>
          {col(props.slice(0, half))}
          {props.length > 1 && col(props.slice(half))}
        </div>
      )}
    </div>
  );
}

// ─── Status bar ───────────────────────────────────────────────────────────────
export function StatusBar({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 22, padding: "0 10px", flexShrink: 0,
      background: "linear-gradient(180deg,#f4f4f4 0%,#e8e8e8 100%)",
      borderTop: "1px solid #c0c0c0",
      fontSize: 11, fontFamily: FONT, color: "#444",
      whiteSpace: "nowrap", overflow: "hidden",
    }}>
      <span>{left}</span>
      {right && <span>{right}</span>}
    </div>
  );
}
