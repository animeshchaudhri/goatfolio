"use client";
import React, { useRef, useState } from "react";
import { FONT, itemStyle, Menu, type MenuItem, type ViewMode } from "./Chrome";
import { EXPLORER_ICONS as ICONS } from "./explorerIcons";
import { iconPath } from "../Desktop/apps";

// Explorer content area: file items in Win7 views, empty-folder text, library header,
// file-type icons and an in-window wizard dialog.

export type FileItem = {
  name: string;
  /** Renders the icon at a pixel size (16 / 48 / 96) */
  icon: (size: number) => React.ReactNode;
  type: string;
  size?: string;
  modified?: string;
  /** Extra details-pane rows, e.g. [["Dimensions:", "1920 x 1080"]] */
  details?: [string, string][];
  /** Values for custom Details-view columns, keyed by column label */
  columns?: Record<string, string>;
  onOpen?: () => void;
};

export type Column = { label: string; width: number; value: (item: FileItem) => string };

export const DEFAULT_COLUMNS: Column[] = [
  { label: "Name",          width: 220, value: (i) => i.name },
  { label: "Date modified", width: 140, value: (i) => i.modified ?? "" },
  { label: "Type",          width: 130, value: (i) => i.type },
  { label: "Size",          width: 80,  value: (i) => i.size ?? "" },
];

// ─── Icon helpers ─────────────────────────────────────────────────────────────
export const imgIcon = (src: string) => (size: number) => (
  <img src={iconPath(src, size)} width={size} height={size} alt="" draggable={false}
    style={{ objectFit: "contain", flexShrink: 0 }} />
);

export const folderIcon = imgIcon(ICONS.folder);

/** Win7 shortcut badge in the bottom-left corner */
export const withShortcut = (base: (size: number) => React.ReactNode) => (size: number) => {
  const b = Math.max(8, Math.round(size * 0.36));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {base(size)}
      <img src={iconPath(ICONS.shortcutOverlay, b)} width={b} height={b} alt="" style={{ position: "absolute", left: 0, bottom: 0 }} />
    </div>
  );
};

export const textIcon = imgIcon(ICONS.textFile);
export const pdfIcon = imgIcon(ICONS.pdfFile);
export const mediaIcon = (kind: "audio" | "video") => imgIcon(kind === "audio" ? ICONS.audioFile : ICONS.videoFile);

/** Photo thumbnail: image in a white frame with a soft shadow (Win7 large-icon thumbnails) */
export const thumbIcon = (src: string) => (size: number) => size <= 16 ? (
  <img src={iconPath(ICONS.imageFile, size)} width={size} height={size} alt="" style={{ flexShrink: 0 }} />
) : (
  <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <img src={src} alt="" draggable={false} style={{
      maxWidth: size - 6, maxHeight: size - 6, objectFit: "contain",
      border: `${size >= 64 ? 3 : 2}px solid #fff`, boxShadow: "0 1px 3px rgba(0,0,0,0.45)",
    }} />
  </div>
);

/** Video thumbnail: first frame between film-strip edges; `src` omitted = no preview loaded */
export const videoThumb = (src?: string) => (size: number) => size <= 16 ? mediaIcon("video")(size) : (
  <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <div style={{
      width: size - 4, height: Math.round((size - 4) * 0.72), background: "#111",
      display: "flex", alignItems: "stretch", boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
    }}>
      {[0, 1].map((side) => (
        <div key={side} style={{
          width: Math.max(5, size * 0.09), flexShrink: 0, order: side * 2,
          backgroundImage: "repeating-linear-gradient(180deg,transparent 0 2px,#d8d8d8 2px 5px,transparent 5px 8px)",
          backgroundSize: "60% 100%", backgroundRepeat: "repeat-y", backgroundPosition: "center",
        }} />
      ))}
      <div style={{ flex: 1, order: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {src ? (
          <video src={`${src}#t=0.5`} preload="metadata" muted playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
        ) : (
          mediaIcon("video")(Math.round(size * 0.45))
        )}
      </div>
    </div>
  </div>
);

// ─── Items view ───────────────────────────────────────────────────────────────
const OPEN_DELAY = 450; // two clicks/taps on the same item within this window = open

export function ItemsView({ items, view, selected, onSelect, columns = DEFAULT_COLUMNS, emptyText = "This folder is empty." }: {
  items: FileItem[];
  view: ViewMode;
  selected: number | null;
  onSelect: (i: number | null) => void;
  columns?: Column[];
  emptyText?: string;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const last = useRef<{ i: number; t: number } | null>(null);

  const click = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    const now = Date.now();
    if (last.current && last.current.i === i && now - last.current.t < OPEN_DELAY) {
      last.current = null;
      items[i].onOpen?.();
    } else {
      last.current = { i, t: now };
      onSelect(i);
    }
  };
  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && selected !== null) items[selected]?.onOpen?.();
  };

  const common = (i: number) => ({
    onClick: (e: React.MouseEvent) => click(e, i),
    onMouseEnter: () => setHov(i),
    onMouseLeave: () => setHov(null),
  });

  const label: React.CSSProperties = { fontSize: 12, fontFamily: FONT, color: "#000", lineHeight: "15px" };

  let body: React.ReactNode;
  if (view === "details") {
    body = (
      <div style={{ minWidth: columns.reduce((w, c) => w + c.width, 0) + 10 }}>
        <div style={{ display: "flex", height: 25, borderBottom: "1px solid #e5e5e5", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          {columns.map((c, ci) => (
            <div key={c.label} style={{
              width: c.width, flexShrink: 0, display: "flex", alignItems: "center",
              padding: ci === 0 ? "0 6px 0 26px" : "0 6px", fontSize: 12, fontFamily: FONT, color: "#4c607a",
              borderRight: "1px solid #e5e5e5", boxSizing: "border-box",
            }}>{c.label}</div>
          ))}
        </div>
        {items.map((it, i) => (
          <div key={it.name + i} {...common(i)} style={{
            display: "flex", alignItems: "center", height: 20, margin: "1px 2px", borderRadius: 3, cursor: "default",
            ...itemStyle(selected === i, hov === i),
          }}>
            {columns.map((c, ci) => (
              <div key={c.label} style={{
                ...label, width: c.width - (ci === 0 ? 0 : 0), flexShrink: 0, boxSizing: "border-box",
                padding: ci === 0 ? "0 6px 0 4px" : "0 6px", display: "flex", alignItems: "center", gap: 5,
                color: ci === 0 ? "#000" : "#6d6d6d", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                justifyContent: c.label === "Size" ? "flex-end" : "flex-start",
              }}>
                {ci === 0 && it.icon(16)}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.value(it)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  } else if (view === "tiles") {
    body = (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: 4 }}>
        {items.map((it, i) => (
          <div key={it.name + i} {...common(i)} style={{
            width: 252, height: 58, display: "flex", alignItems: "center", gap: 6, padding: "0 6px",
            borderRadius: 3, cursor: "default", boxSizing: "border-box", ...itemStyle(selected === i, hov === i),
          }}>
            {it.icon(48)}
            <div style={{ minWidth: 0 }}>
              <div style={{ ...label, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
              <div style={{ ...label, color: "#6d6d6d", whiteSpace: "nowrap" }}>{it.type}</div>
              {it.size && <div style={{ ...label, color: "#6d6d6d", whiteSpace: "nowrap" }}>{it.size}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  } else if (view === "small" || view === "list") {
    body = (
      <div style={{
        display: "flex", flexWrap: "wrap", padding: 4, gap: 1,
        flexDirection: view === "list" ? "column" : "row", alignContent: "flex-start",
        maxHeight: view === "list" ? "100%" : undefined,
      }}>
        {items.map((it, i) => (
          <div key={it.name + i} {...common(i)} style={{
            width: 220, height: 20, display: "flex", alignItems: "center", gap: 5, padding: "0 4px",
            borderRadius: 3, cursor: "default", boxSizing: "border-box", ...itemStyle(selected === i, hov === i),
          }}>
            {it.icon(16)}
            <span style={{ ...label, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</span>
          </div>
        ))}
      </div>
    );
  } else {
    const iconSize = view === "large" ? 96 : 48;
    const cellW = view === "large" ? 108 : 76;
    body = (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: 6, alignContent: "flex-start" }}>
        {items.map((it, i) => (
          <div key={it.name + i} {...common(i)} style={{
            width: cellW, display: "flex", flexDirection: "column", alignItems: "center",
            padding: "3px 2px 4px", borderRadius: 3, cursor: "default", boxSizing: "border-box",
            ...itemStyle(selected === i, hov === i),
          }}>
            {it.icon(iconSize)}
            <div style={{
              ...label, textAlign: "center", marginTop: 3, maxWidth: cellW - 6, wordBreak: "break-word",
              display: "-webkit-box", WebkitLineClamp: selected === i ? 4 : 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{it.name}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={keys}
      onClick={() => onSelect(null)}
      style={{ flex: 1, minHeight: 0, overflow: "auto", background: "#fff", outline: "none", userSelect: "none", position: "relative" }}
    >
      {view === "details" && items.length === 0 ? (
        <>{body}<EmptyText text={emptyText} /></>
      ) : items.length === 0 ? (
        <EmptyText text={emptyText} />
      ) : body}
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 10px", fontSize: 12, fontFamily: FONT, color: "#6d6d6d" }}>
      {text}
    </div>
  );
}

// ─── Library header ("Documents library / Includes: 2 locations   Arrange by: Folder ▾") ──
export function LibraryHeader({ title, subtitle, includes, arrange, arrangeOptions, onArrange }: {
  title: string;
  /** Free text under the title (used instead of `includes`) */
  subtitle?: string;
  /** Location menu shown from the "N locations" link */
  includes?: MenuItem[];
  arrange?: string;
  arrangeOptions?: string[];
  onArrange?: (v: string) => void;
}) {
  const [open, setOpen] = useState<"includes" | "arrange" | null>(null);
  const link: React.CSSProperties = { color: "#1e5cb3", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 };
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10,
      padding: "8px 14px 7px", flexShrink: 0, position: "relative",
      background: "linear-gradient(180deg,#fdfeff 0%,#eef3fa 100%)",
      borderBottom: "1px solid #dde5f0",
      fontFamily: FONT, fontSize: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, color: "#1e395b", whiteSpace: "nowrap" }}>{title}</div>
        {subtitle && <div style={{ color: "#5a677c", marginTop: 1 }}>{subtitle}</div>}
        {includes && (
          <div style={{ color: "#5a677c", marginTop: 1, position: "relative" }}>
            Includes:{" "}
            <span style={link} onClick={() => setOpen(open === "includes" ? null : "includes")}>
              {includes.length} locations
            </span>
            {open === "includes" && (
              <Menu items={includes} onClose={() => setOpen(null)} style={{ top: 18, left: 50, minWidth: 260 }} />
            )}
          </div>
        )}
      </div>
      {arrangeOptions && onArrange && (
        <div style={{ color: "#5a677c", whiteSpace: "nowrap", marginTop: 3, position: "relative" }}>
          Arrange by:{" "}
          <span style={link} onClick={() => setOpen(open === "arrange" ? null : "arrange")}>
            {arrange}
            <svg width="7" height="4" viewBox="0 0 7 4"><path d="M0 0h7L3.5 4z" fill="#1e5cb3" /></svg>
          </span>
          {open === "arrange" && (
            <Menu
              onClose={() => setOpen(null)}
              style={{ top: 18, right: 0, minWidth: 150 }}
              items={arrangeOptions.map((o) => ({ label: o, radio: o === arrange, onClick: () => onArrange(o) }))}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── In-window wizard / dialog (Win7 "Add a device", "Map Network Drive", …) ──
export function InlineDialog({ title, icon, onClose, footer, width = 520, children }: {
  title: string;
  icon?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 40, display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "16px 0", overflowY: "auto", background: "rgba(255,255,255,0.01)",
    }} onClick={(e) => e.stopPropagation()}>
      <div className="window active" style={{ width, maxWidth: "calc(100% - 16px)", fontFamily: FONT, fontSize: 12 }}>
        <div className="title-bar">
          <div className="title-bar-text" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {icon && <img src={iconPath(icon, 16)} width={16} height={16} alt="" />}
            {title}
          </div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
        <div className="window-body" style={{ background: "#fff", padding: "14px 20px 18px", minHeight: 150 }}>
          {children}
        </div>
        {footer && (
          <footer style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/** Wizard heading in Win7 "main instruction" blue */
export function Instruction({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 15, color: "#1e395b", marginBottom: 10 }}>{children}</div>;
}
