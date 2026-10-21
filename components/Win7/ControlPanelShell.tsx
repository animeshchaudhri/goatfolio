"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useDesktop } from "../Desktop/DesktopContext";
import { APPS } from "../Desktop/apps";
import { FONT, TitleBar, AddressBar, ExplorerBody, EXPLORER_CANCEL } from "./Chrome";
import type { WindowProps } from "../Desktop/windows";

// Shared chrome for Control Panel pages: address bar, blue task pane, white content area and the
// Win7 link / tile styles those pages use.

export const CP_BLUE = "#1E3287";
export const CP_GREEN = "#1E7D1E";

const CP_CSS = `
  .cp-link { color: #0066cc; cursor: pointer; text-decoration: none; }
  .cp-link:hover { color: #3399ff; text-decoration: underline; }
  .cp-cat { color: ${CP_GREEN}; cursor: pointer; font-size: 14px; text-decoration: none; }
  .cp-cat:hover { color: #2fa52f; text-decoration: underline; }
  .cp-task { color: ${CP_BLUE}; cursor: pointer; text-decoration: none; display: block; line-height: 1.35; }
  .cp-task:hover { color: #3399ff; text-decoration: underline; }
  .cp-tile { border: 1px solid transparent; border-radius: 3px; cursor: default; }
  .cp-tile:hover { background: linear-gradient(180deg, #fafbfd 0%, #ebf3fd 100%); border-color: #b8d6fb; }
  .cp-tile.is-selected { background: linear-gradient(180deg, #dcebfc 0%, #c1dbfc 100%); border-color: #7da2ce; }
  .cp-tile.is-selected:hover { background: linear-gradient(180deg, #e6f0fd 0%, #cfe3fc 100%); }
  .cp-main::-webkit-scrollbar { display: block; width: 17px; }
`;

const NarrowContext = createContext(false);
/** True when the content area is too narrow for two-column / task-pane layouts (phones) */
export const useNarrow = () => useContext(NarrowContext);

/** Back/forward history for in-window navigation */
export function useNav<T>(initial: T) {
  const [stack, setStack] = useState({ items: [initial], i: 0 });
  const go = useCallback((v: T) => setStack((s) => ({ items: [...s.items.slice(0, s.i + 1), v], i: s.i + 1 })), []);
  return {
    cur: stack.items[stack.i],
    go,
    back: stack.i > 0 ? () => setStack((s) => ({ ...s, i: s.i - 1 })) : undefined,
    fwd: stack.i < stack.items.length - 1 ? () => setStack((s) => ({ ...s, i: s.i + 1 })) : undefined,
  };
}

/** Opens "App name" or "App name#view" (the view is passed to the window as `app.url`) */
export function useOpen() {
  const { openApp } = useDesktop();
  return useCallback((to: string) => {
    const [name, view] = to.split("#");
    if (view && APPS[name]) openApp({ ...APPS[name], url: view });
    else openApp(name);
  }, [openApp]);
}

/** Renders over the whole screen, outside the draggable window (whose transform would trap position: fixed) */
export function Overlay({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

export function Link({ children, onClick, className = "cp-link", style }: {
  children: React.ReactNode; onClick: () => void; className?: string; style?: React.CSSProperties;
}) {
  return (
    <span
      role="link"
      tabIndex={0}
      className={className}
      style={style}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {children}
    </span>
  );
}

export function Heading({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h1 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 400, color: CP_BLUE, margin: "2px 0 8px", ...style }}>
      {children}
    </h1>
  );
}

export function TaskPane({ children, seeAlso }: {
  children: React.ReactNode;
  seeAlso?: { label: string; onClick: () => void }[];
}) {
  return (
    <div style={{
      width: 194, flexShrink: 0, display: "flex", flexDirection: "column", gap: 9,
      padding: "14px 12px 14px 16px", overflowY: "auto",
      background: "linear-gradient(180deg,#f9fbfe 0%,#ecf2fa 55%,#dfe8f5 100%)",
      fontFamily: FONT, fontSize: 12,
    }}>
      {children}
      {seeAlso && (
        <div style={{ marginTop: "auto", paddingTop: 16, display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ color: "#4d6082" }}>See also</div>
          {seeAlso.map((l) => <Link key={l.label} className="cp-task" onClick={l.onClick}>{l.label}</Link>)}
        </div>
      )}
    </div>
  );
}

export function CPWindow({
  title, icon, path, onBack, onForward, onCrumb, search, onSearch, searchPlaceholder = "Search Control Panel",
  taskPane, width = "780px", height = "540px", children, onClose, zIndex, onFocus, minimized, onMinimize,
}: Omit<WindowProps, "app"> & {
  title: string;
  icon: string;
  path: string[];
  onBack?: () => void;
  onForward?: () => void;
  /** Breadcrumb click: segment index, -1 for the leading icon */
  onCrumb?: (index: number) => void;
  search?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  taskPane?: React.ReactNode;
  width?: string;
  height?: string;
  children: React.ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 600));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <DraggableWindow
      cancelSelector={EXPLORER_CANCEL}
      zIndex={zIndex}
      width={width}
      height={height}
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <style>{CP_CSS}</style>
      <TitleBar title={title} icon={icon} onClose={onClose} />
      <AddressBar
        icon={icon}
        path={path}
        onBack={onBack}
        onForward={onForward}
        onCrumb={onCrumb}
        search={search}
        onSearch={onSearch}
        searchPlaceholder={narrow ? undefined : searchPlaceholder}
      />
      <ExplorerBody>
        <div ref={bodyRef} style={{
          flex: 1, minHeight: 0, display: "flex",
          fontFamily: FONT, fontSize: 12, color: "#1a1a1a",
        }}>
          {taskPane && !narrow && taskPane}
          <div className="cp-main" style={{
            flex: 1, minWidth: 0, overflowY: "auto", display: "flex", flexDirection: "column",
            padding: narrow ? "12px 12px 14px" : "14px 24px 16px 22px",
          }}>
            <NarrowContext.Provider value={narrow}>{children}</NarrowContext.Provider>
          </div>
        </div>
      </ExplorerBody>
    </DraggableWindow>
  );
}
