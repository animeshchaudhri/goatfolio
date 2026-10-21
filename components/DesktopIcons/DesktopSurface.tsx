"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DesktopIcon from "./DesktopIcons";
import DesktopDialog from "./DesktopDialog";
import styles from "./Helper.module.css";
import { ICONS } from "./icons";
import ContextMenu, { type MenuEntry } from "../Navigation/RightClick";
import { NavBtn } from "../Win7/Chrome";
import { desktopIcons } from "../Icons";
import { useDesktop } from "../Desktop/DesktopContext";
import { useGadgets } from "../Gadgets/GadgetsContext";
import { APPS, ACTIONS, iconPath, type App } from "../Desktop/apps";
import {
  DEFAULT_VIEW, METRICS, ORIGIN, TASKBAR_H, builtinItems, cellToPx, customToItem, gridSize, layout,
  loadArray, loadJSON, nearestFree, pxToCell, sortItems, uniqueName,
  type Cell, type CustomItem, type CustomKind, type DesktopItem, type SortKey, type ViewSettings,
} from "./desktopModel";

// The desktop background: icons, selection (click / Ctrl+click / rubber band), drag & drop,
// the desktop and icon context menus, New ▸ items, rename, delete and Create Shortcut.

const SORT_LABEL: Record<SortKey, string> = { name: "Name", size: "Size", type: "Item type", date: "Date modified" };
const LONG_PRESS = 500;

type MenuState = { x: number; y: number; target: "desktop" | "icon" };
type DialogState =
  | { kind: "delete"; ids: string[] }
  | { kind: "shortcut" };
type Drag = {
  id: string; ids: string[]; x: number; y: number; pointerId: number; type: string;
  moved: boolean; fired: boolean; timer?: ReturnType<typeof setTimeout>;
};

/** Explorer window for a folder created on the desktop (Library shows unknown paths as empty folders) */
const folderApp = (title: string): App => ({ title, url: `Local Disk (C:)/Users/Animesh/Desktop/${title}`, type: "library", icon: "win7:folder" });

const cellKey = (c: Cell) => `${Math.round(c.col)}:${Math.round(c.row)}`;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

function ErrorIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="desk-err" cx=".4" cy=".3" r=".8">
          <stop offset="0" stopColor="#ff8a7a" />
          <stop offset=".6" stopColor="#e0281a" />
          <stop offset="1" stopColor="#a10f08" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill="url(#desk-err)" stroke="#8a0d06" />
      <path d="M10.5 10.5l11 11M21.5 10.5l-11 11" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

const WIZARD_TEXT: React.CSSProperties = { margin: "0 0 4px" };

type Resolved = { target: string | App; img: string; name: string };

/** What the Create Shortcut location box points at: an app name ("notepad") or a web address */
function resolveLocation(raw: string): Resolved | null {
  const s = raw.trim().replace(/^"(.*)"$/, "$1");
  const bare = s.replace(/\.(exe|lnk)$/i, "").toLowerCase();
  const app = Object.keys(APPS).find((k) => k.toLowerCase() === bare || APPS[k].title.toLowerCase() === bare);
  if (app) return { target: app, img: iconPath(APPS[app].icon), name: APPS[app].title };
  const action = Object.keys(ACTIONS).find((k) => k.toLowerCase() === bare);
  if (action) return { target: action, img: iconPath(action.toLowerCase()), name: action };
  const hasScheme = /^https?:\/\//i.test(s);
  if (hasScheme || /^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(s)) {
    try {
      const url = new URL(hasScheme ? s : `https://${s}`).href;
      return { target: { title: "", url, type: "browser", icon: "internet" }, img: ICONS.internetShortcut, name: "New Internet Shortcut" };
    } catch {
      return null;
    }
  }
  return null;
}

function ShortcutWizard({ onCancel, onFinish }: {
  onCancel: () => void;
  onFinish: (name: string, r: Resolved) => void;
}) {
  const [page, setPage] = useState<1 | 2>(1);
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [resolved, setResolved] = useState<Resolved | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = () => {
    const r = resolveLocation(location);
    if (!r) return setError(location.trim());
    setResolved(r);
    setName(r.name);
    setPage(2);
  };
  const finish = () => {
    const n = name.trim().replace(/[\\/:*?"<>|]/g, "");
    if (n && resolved) onFinish(n, resolved);
  };

  return (
    <>
    <DesktopDialog
      title="Create Shortcut"
      width={520}
      onClose={() => { if (!error) onCancel(); }}
      titleExtra={<NavBtn dir="back" disabled={page === 1} onClick={() => setPage(1)} />}
      footer={
        <>
          {page === 1
            ? <button className="default" disabled={!location.trim()} onClick={next}>Next</button>
            : <button className="default" disabled={!name.trim()} onClick={finish}>Finish</button>}
          <button onClick={onCancel}>Cancel</button>
        </>
      }
    >
      <form
        onSubmit={(e) => { e.preventDefault(); if (page === 1) { if (location.trim()) next(); } else finish(); }}
        style={{ minHeight: 210, padding: "2px 18px 0" }}
      >
        {page === 1 ? (
          <>
            <h2 className="instruction instruction-primary" style={{ marginTop: 0 }}>
              What item would you like to create a shortcut for?
            </h2>
            <p style={WIZARD_TEXT}>
              This wizard helps you to create shortcuts to local or network programs, files, folders, computers, or Internet addresses.
            </p>
            <label htmlFor="shortcut-location" style={{ display: "block", marginTop: 26, marginBottom: 4 }}>
              Type the location of the item:
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="shortcut-location"
                type="text"
                autoFocus
                autoComplete="off"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder=""
                style={{ flex: 1, minWidth: 0 }}
              />
              <button type="button" disabled>Browse...</button>
            </div>
            <p style={{ ...WIZARD_TEXT, marginTop: 22 }}>Click Next to continue.</p>
          </>
        ) : (
          <>
            <h2 className="instruction instruction-primary" style={{ marginTop: 0 }}>
              What would you like to name the shortcut?
            </h2>
            <label htmlFor="shortcut-name" style={{ display: "block", marginTop: 26, marginBottom: 4 }}>
              Type a name for this shortcut:
            </label>
            <input
              id="shortcut-name"
              type="text"
              autoFocus
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            <p style={{ ...WIZARD_TEXT, marginTop: 22 }}>Click Finish to create the shortcut.</p>
          </>
        )}
      </form>
    </DesktopDialog>
    {error !== null && (
      <DesktopDialog
        title="Create Shortcut"
        width={430}
        zIndex={6100}
        onClose={() => setError(null)}
        footer={<button className="default" autoFocus onClick={() => setError(null)}>OK</button>}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <ErrorIcon />
          <p style={{ margin: "6px 0 0" }}>
            Windows cannot find &apos;{error}&apos;. Make sure you typed the name correctly, and then try again.
          </p>
        </div>
      </DesktopDialog>
    )}
    </>
  );
}

function DeleteDialog({ items, onYes, onNo }: { items: DesktopItem[]; onYes: () => void; onNo: () => void }) {
  const one = items.length === 1 ? items[0] : null;
  const what = one?.custom?.kind === "folder" ? "folder" : one?.custom?.kind === "text" ? "file" : "shortcut";
  const title = one ? `Delete ${what[0].toUpperCase()}${what.slice(1)}` : "Delete Multiple Items";
  const created = one ? new Date(one.modified).toLocaleString(undefined, {
    month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  }) : "";
  return (
    <DesktopDialog
      title={title}
      width={420}
      onClose={onNo}
      footer={
        <>
          <button className="default" autoFocus onClick={onYes}>Yes</button>
          <button onClick={onNo}>No</button>
        </>
      }
    >
      <p style={{ margin: "0 0 14px" }}>
        {one
          ? `Are you sure you want to move this ${what} to the Recycle Bin?`
          : `Are you sure you want to move these ${items.length} items to the Recycle Bin?`}
      </p>
      {one && (
        <div style={{ display: "flex", gap: 14, alignItems: "center", paddingLeft: 6 }}>
          <img src={one.img} width={48} height={48} alt="" />
          <div style={{ lineHeight: "17px" }}>
            <div>{one.title}</div>
            <div style={{ color: "#5a5a5a" }}>Date created: {created}</div>
          </div>
        </div>
      )}
    </DesktopDialog>
  );
}

export default function DesktopSurface() {
  const { openApp } = useDesktop();
  const { showGadgets, setShowGadgets } = useGadgets();
  const surface = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [vp, setVp] = useState({ w: 1280, h: 800 });
  const [view, setView] = useState<ViewSettings>(DEFAULT_VIEW);
  const [customs, setCustoms] = useState<CustomItem[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [positions, setPositions] = useState<Record<string, Cell>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [dragging, setDragging] = useState<{ ids: string[]; dx: number; dy: number } | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const drag = useRef<Drag | null>(null);
  const bandBase = useRef<Set<string>>(new Set());
  const press = useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const lastTap = useRef<{ id: string; t: number } | null>(null);
  const lastPointer = useRef("mouse");
  const newAt = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ─── Load / persist ─────────────────────────────────────────────────────────
  useEffect(() => {
    setView(loadJSON("desktop.view", DEFAULT_VIEW));
    setCustoms(loadArray<CustomItem>("desktop.items"));
    setOrder(loadArray<string>("desktop.order"));
    setPositions(loadJSON<Record<string, Cell>>("desktop.positions", {}));
    const resize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    resize();
    window.addEventListener("resize", resize);
    setMounted(true);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => { if (mounted) localStorage.setItem("desktop.view", JSON.stringify(view)); }, [view, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem("desktop.items", JSON.stringify(customs)); }, [customs, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem("desktop.order", JSON.stringify(order)); }, [order, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem("desktop.positions", JSON.stringify(positions)); }, [positions, mounted]);

  // ─── Derived layout ─────────────────────────────────────────────────────────
  const items = useMemo(() => [...builtinItems(desktopIcons), ...customs.map(customToItem)], [customs]);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const fullOrder = useMemo(() => {
    const known = order.filter((id) => byId.has(id));
    return [...known, ...items.map((i) => i.id).filter((id) => !known.includes(id))];
  }, [order, items, byId]);

  const m = METRICS[view.size];
  const { rows, cols } = gridSize(m, vp.w, vp.h);
  const cells = useMemo(
    () => layout(fullOrder, positions, view.autoArrange, rows, cols),
    [fullOrder, positions, view.autoArrange, rows, cols],
  );
  const px = (id: string) => cellToPx(cells[id], m);
  const setViewP = (p: Partial<ViewSettings>) => setView((v) => ({ ...v, ...p }));
  const focusSurface = () => surface.current?.focus({ preventScroll: true });

  // ─── Actions ────────────────────────────────────────────────────────────────
  const open = useCallback((id: string) => {
    const it = byId.get(id);
    if (!it) return;
    const c = it.custom;
    if (!c) return openApp(id);
    if (c.kind === "folder") openApp(folderApp(c.title));
    else if (c.kind === "text") openApp("Notepad");
    else if (typeof c.target === "object" && /^https?:/.test(c.target.url)) window.open(c.target.url, "_blank", "noopener");
    else if (c.target) openApp(c.target);
  }, [byId, openApp]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 140);
  };

  const sortBy = (key: SortKey) => {
    const desc = view.sort?.key === key ? !view.sort.desc : false;
    setOrder(sortItems(items, key, desc));
    setPositions({});
    setViewP({ sort: { key, desc } });
  };

  const snapAll = (): Record<string, Cell> => {
    const taken = new Set<string>();
    const out: Record<string, Cell> = {};
    for (const id of fullOrder) {
      const c = nearestFree({ col: Math.round(cells[id].col), row: Math.round(cells[id].row) }, taken, rows, cols);
      taken.add(cellKey(c));
      out[id] = c;
    }
    return out;
  };

  /** Free cell nearest to a desktop point, for newly created items */
  const freeCellNear = (x: number, y: number, extraTaken: Cell[] = []) => {
    const taken = new Set([...Object.values(cells), ...extraTaken].map(cellKey));
    const c = pxToCell(x - m.cellW / 2, y - m.cellH / 2, m);
    return nearestFree({ col: Math.round(c.col), row: Math.round(c.row) }, taken, rows, cols);
  };

  const addCustom = (c: CustomItem, at: Cell, rename: boolean) => {
    setCustoms((cs) => [...cs, c]);
    setOrder([...fullOrder, c.id]);
    if (!view.autoArrange) setPositions({ ...cells, [c.id]: at });
    setSelected(new Set([c.id]));
    if (rename) setRenaming(c.id);
  };

  const createItem = (kind: CustomKind) => {
    const base = kind === "folder" ? "New folder" : "New Text Document";
    const c: CustomItem = { id: `custom-${Date.now()}`, kind, title: uniqueName(base, items.map((i) => i.title)), created: Date.now() };
    addCustom(c, freeCellNear(newAt.current.x, newAt.current.y), true);
  };

  const createShortcutTo = (it: DesktopItem) => {
    const c = it.custom;
    const target: string | App =
      !c ? it.id :
      c.kind === "folder" ? folderApp(c.title) :
      c.kind === "text" ? "Notepad" :
      c.target ?? "Notepad";
    const p = px(it.id);
    const sc: CustomItem = {
      id: `custom-${Date.now()}`, kind: "shortcut", created: Date.now(), target, img: it.img,
      title: uniqueName(`${it.title} - Shortcut`, items.map((i) => i.title)),
    };
    addCustom(sc, freeCellNear(p.x + m.cellW * 1.5, p.y + m.cellH / 2), false);
  };

  const rename = (id: string, name: string | null) => {
    setRenaming(null);
    focusSurface();
    if (name === null) return;
    const t = name.trim().replace(/[\\/:*?"<>|]/g, "");
    if (!t) return;
    const others = items.filter((i) => i.id !== id).map((i) => i.title);
    setCustoms((cs) => cs.map((c) => (c.id === id ? { ...c, title: uniqueName(t, others) } : c)));
  };

  const deleteItems = (ids: string[]) => {
    const gone = new Set(ids.filter((id) => byId.get(id)?.custom));
    setCustoms((cs) => cs.filter((c) => !gone.has(c.id)));
    setOrder((o) => o.filter((id) => !gone.has(id)));
    setPositions((p) => Object.fromEntries(Object.entries(p).filter(([id]) => !gone.has(id))));
    setSelected(new Set());
  };

  // ─── Icon pointer handling ──────────────────────────────────────────────────
  const iconDown = (id: string) => (e: React.PointerEvent<HTMLDivElement>) => {
    lastPointer.current = e.pointerType;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.stopPropagation();
    focusSurface();
    let ids: string[];
    if (e.ctrlKey || e.metaKey) {
      const s = new Set(selected);
      if (s.has(id)) s.delete(id); else s.add(id);
      setSelected(s);
      if (!s.has(id)) return;
      ids = [...s];
    } else if (selected.has(id)) {
      ids = [...selected];
    } else {
      setSelected(new Set([id]));
      ids = [id];
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const d: Drag = { id, ids, x: e.clientX, y: e.clientY, pointerId: e.pointerId, type: e.pointerType, moved: false, fired: false };
    if (e.pointerType !== "mouse") {
      const { clientX: x, clientY: y } = e;
      d.timer = setTimeout(() => {
        if (drag.current !== d || d.moved) return;
        d.fired = true;
        setMenu({ x, y, target: "icon" });
      }, LONG_PRESS);
    }
    drag.current = d;
  };

  const iconMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId || d.fired) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < (d.type === "mouse" ? 4 : 10)) return;
      d.moved = true;
      clearTimeout(d.timer);
    }
    setDragging({ ids: d.ids, dx, dy });
  };

  const drop = (d: Drag, dx: number, dy: number) => {
    const ids = fullOrder.filter((id) => d.ids.includes(id));
    // Dropped on the Recycle Bin: user-created items go in the bin, built-ins stay put
    const bin = cells["Recycle Bin"] && !ids.includes("Recycle Bin") ? px("Recycle Bin") : null;
    const pointer = { x: d.x + dx, y: d.y + dy };
    if (bin && pointer.x >= bin.x && pointer.x <= bin.x + m.cellW && pointer.y >= bin.y && pointer.y <= bin.y + m.cellH) {
      if (ids.every((id) => byId.get(id)?.custom)) deleteItems(ids);
      return;
    }
    const lead = px(d.id);
    if (view.autoArrange) {
      const col = clamp(Math.round((lead.x + dx - ORIGIN.x) / m.cellW), 0, cols - 1);
      const row = clamp(Math.round((lead.y + dy - ORIGIN.y) / m.cellH), 0, rows - 1);
      const rest = fullOrder.filter((id) => !ids.includes(id));
      rest.splice(Math.min(col * rows + row, rest.length), 0, ...ids);
      setOrder(rest);
      return;
    }
    const next: Record<string, Cell> = { ...cells };
    const taken = new Set(fullOrder.filter((id) => !ids.includes(id)).map((id) => cellKey(cells[id])));
    for (const id of ids) {
      const p = px(id);
      const x = clamp(p.x + dx, 0, vp.w - m.cellW);
      const y = clamp(p.y + dy, 0, vp.h - TASKBAR_H - m.cellH);
      let c = pxToCell(x, y, m);
      if (view.alignToGrid) {
        c = nearestFree({ col: Math.round(c.col), row: Math.round(c.row) }, taken, rows, cols);
        taken.add(cellKey(c));
      }
      next[id] = c;
    }
    setPositions(next);
  };

  const iconUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    clearTimeout(d.timer);
    drag.current = null;
    setDragging(null);
    if (e.type === "pointercancel" || d.fired) return;
    if (d.moved) return drop(d, e.clientX - d.x, e.clientY - d.y);
    if (!(e.ctrlKey || e.metaKey) && selected.size > 1) setSelected(new Set([d.id]));
    if (d.type !== "mouse") {
      const now = Date.now();
      if (lastTap.current?.id === d.id && now - lastTap.current.t < 450) {
        lastTap.current = null;
        open(d.id);
      } else {
        lastTap.current = { id: d.id, t: now };
      }
    }
  };

  // ─── Desktop background pointer handling (rubber band, long-press) ─────────
  const hitTest = (x0: number, y0: number, x1: number, y1: number) => {
    const l = Math.min(x0, x1), r = Math.max(x0, x1), t = Math.min(y0, y1), b = Math.max(y0, y1);
    const hits: string[] = [];
    surface.current?.querySelectorAll<HTMLElement>("[data-icon-id]").forEach((el) => {
      const box = el.querySelector("[data-icon-box]")?.getBoundingClientRect();
      if (box && box.left < r && box.right > l && box.top < b && box.bottom > t) hits.push(el.dataset.iconId!);
    });
    return hits;
  };

  const surfaceDown = (e: React.PointerEvent<HTMLDivElement>) => {
    lastPointer.current = e.pointerType;
    if (e.target !== e.currentTarget) return;
    focusSurface();
    if (e.pointerType === "mouse") {
      if (e.button !== 0) return;
      const additive = e.ctrlKey || e.metaKey;
      bandBase.current = additive ? new Set(selected) : new Set();
      if (!additive) setSelected(new Set());
      e.currentTarget.setPointerCapture(e.pointerId);
      setBand({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY });
      return;
    }
    setSelected(new Set());
    const { clientX: x, clientY: y } = e;
    press.current = {
      x, y,
      timer: setTimeout(() => {
        press.current = null;
        newAt.current = { x, y };
        setMenu({ x, y, target: "desktop" });
      }, LONG_PRESS),
    };
  };

  const surfaceMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (press.current && Math.hypot(e.clientX - press.current.x, e.clientY - press.current.y) > 10) {
      clearTimeout(press.current.timer);
      press.current = null;
    }
    if (!band) return;
    const next = { ...band, x1: e.clientX, y1: e.clientY };
    setBand(next);
    setSelected(new Set([...bandBase.current, ...hitTest(next.x0, next.y0, next.x1, next.y1)]));
  };

  const surfaceUp = () => {
    if (press.current) { clearTimeout(press.current.timer); press.current = null; }
    setBand(null);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (lastPointer.current === "touch") return; // long-press already handled it
    const iconEl = (e.target as Element).closest<HTMLElement>("[data-icon-id]");
    if (iconEl) {
      const id = iconEl.dataset.iconId!;
      if (!selected.has(id)) setSelected(new Set([id]));
      setMenu({ x: e.clientX, y: e.clientY, target: "icon" });
    } else {
      setSelected(new Set());
      newAt.current = { x: e.clientX, y: e.clientY };
      setMenu({ x: e.clientX, y: e.clientY, target: "desktop" });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (renaming || dialog) return;
    const sel = fullOrder.filter((id) => selected.has(id));
    const key = e.key.toLowerCase();
    if (e.key === "Delete" && sel.some((id) => byId.get(id)?.custom)) {
      setDialog({ kind: "delete", ids: sel.filter((id) => byId.get(id)?.custom) });
    } else if (e.key === "F2" && sel.length === 1 && byId.get(sel[0])?.custom) {
      e.preventDefault();
      setRenaming(sel[0]);
    } else if (e.key === "Enter") {
      sel.forEach(open);
    } else if ((e.ctrlKey || e.metaKey) && key === "a") {
      e.preventDefault();
      setSelected(new Set(fullOrder));
    } else if (e.key === "F5") {
      e.preventDefault();
      refresh();
    } else if (e.key === "Escape") {
      setSelected(new Set());
    }
  };

  // ─── Menus ──────────────────────────────────────────────────────────────────
  const desktopMenu: MenuEntry[] = [
    {
      label: "View",
      submenu: [
        { label: "Large icons",  radio: true, checked: view.size === "large",  onSelect: () => setViewP({ size: "large" }) },
        { label: "Medium icons", radio: true, checked: view.size === "medium", onSelect: () => setViewP({ size: "medium" }) },
        { label: "Small icons",  radio: true, checked: view.size === "small",  onSelect: () => setViewP({ size: "small" }) },
        "separator",
        {
          label: "Auto arrange icons", checked: view.autoArrange,
          onSelect: () => {
            if (view.autoArrange) setPositions(cells); // keep icons where they are
            setViewP({ autoArrange: !view.autoArrange });
          },
        },
        {
          label: "Align icons to grid", checked: view.alignToGrid || view.autoArrange, disabled: view.autoArrange,
          onSelect: () => {
            if (!view.alignToGrid) setPositions(snapAll());
            setViewP({ alignToGrid: !view.alignToGrid });
          },
        },
        "separator",
        {
          label: "Show desktop icons", checked: view.showIcons,
          onSelect: () => { setSelected(new Set()); setViewP({ showIcons: !view.showIcons }); },
        },
        { label: "Show desktop gadgets", checked: showGadgets, onSelect: () => setShowGadgets(!showGadgets) },
      ],
    },
    { label: "Sort by", submenu: (Object.keys(SORT_LABEL) as SortKey[]).map((k) => ({ label: SORT_LABEL[k], onSelect: () => sortBy(k) })) },
    { label: "Refresh", onSelect: refresh },
    "separator",
    { label: "Paste", disabled: true },
    { label: "Paste shortcut", disabled: true },
    "separator",
    {
      label: "New",
      submenu: [
        { label: "Folder", icon: ICONS.newFolder, onSelect: () => createItem("folder") },
        { label: "Shortcut", icon: ICONS.newShortcut, onSelect: () => setDialog({ kind: "shortcut" }) },
        "separator",
        { label: "Text Document", icon: ICONS.newTextDocument, onSelect: () => createItem("text") },
      ],
    },
    "separator",
    { label: "Screen resolution", icon: ICONS.screenResolution, onSelect: () => openApp("Screen Resolution") },
    { label: "Gadgets", icon: ICONS.gadgets, onSelect: () => openApp("Gadgets") },
    { label: "Personalize", icon: ICONS.personalize, onSelect: () => openApp("Personalization") },
  ];

  const sel = fullOrder.filter((id) => selected.has(id));
  const single = sel.length === 1 ? byId.get(sel[0]) : undefined;
  const iconMenu: MenuEntry[] = [
    { label: "Open", bold: true, onSelect: () => sel.forEach(open) },
    ...(single?.id === "Recycle Bin" ? [{ label: "Empty Recycle Bin", disabled: true }] : []),
    "separator",
    { label: "Create shortcut", disabled: !single, onSelect: () => single && createShortcutTo(single) },
    {
      label: "Delete", disabled: !sel.length || !sel.every((id) => byId.get(id)?.custom),
      onSelect: () => setDialog({ kind: "delete", ids: sel }),
    },
    { label: "Rename", disabled: !single?.custom, onSelect: () => single && setRenaming(single.id) },
    "separator",
    { label: "Properties", disabled: true },
  ];

  const closeDialog = () => { setDialog(null); focusSurface(); };

  return (
    <>
      <div
        ref={surface}
        tabIndex={-1}
        aria-label="Desktop"
        style={{
          position: "absolute", inset: 0, outline: "none", touchAction: "none",
          userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
        }}
        onPointerDown={surfaceDown}
        onPointerMove={surfaceMove}
        onPointerUp={surfaceUp}
        onPointerCancel={surfaceUp}
        onContextMenu={onContextMenu}
        onKeyDown={onKeyDown}
      >
        {mounted && view.showIcons && !refreshing && fullOrder.map((id) => {
          const p = px(id);
          return (
            <DesktopIcon
              key={id}
              item={byId.get(id)!}
              x={p.x}
              y={p.y}
              size={view.size}
              metrics={m}
              selected={selected.has(id)}
              renaming={renaming === id}
              onRename={(name) => rename(id, name)}
              onPointerDown={iconDown(id)}
              onPointerMove={iconMove}
              onPointerUp={iconUp}
              onDoubleClick={() => { if (lastPointer.current === "mouse") open(id); }}
            />
          );
        })}
        {dragging && dragging.ids.filter((id) => cells[id]).map((id) => {
          const p = px(id);
          return (
            <DesktopIcon
              key={`ghost-${id}`}
              item={byId.get(id)!}
              x={p.x + dragging.dx}
              y={p.y + dragging.dy}
              size={view.size}
              metrics={m}
              ghost
            />
          );
        })}
        {band && (
          <div className={styles.band} style={{
            left: Math.min(band.x0, band.x1), top: Math.min(band.y0, band.y1),
            width: Math.abs(band.x1 - band.x0), height: Math.abs(band.y1 - band.y0),
          }} />
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={menu.target === "desktop" ? desktopMenu : iconMenu}
          onClose={() => setMenu(null)}
        />
      )}

      {dialog?.kind === "delete" && (
        <DeleteDialog
          items={dialog.ids.map((id) => byId.get(id)!).filter(Boolean)}
          onYes={() => { deleteItems(dialog.ids); closeDialog(); }}
          onNo={closeDialog}
        />
      )}
      {dialog?.kind === "shortcut" && (
        <ShortcutWizard
          onCancel={closeDialog}
          onFinish={(name, r) => {
            const target = typeof r.target === "object" ? { ...r.target, title: name } : r.target;
            const c: CustomItem = { id: `custom-${Date.now()}`, kind: "shortcut", created: Date.now(), target, img: r.img, title: uniqueName(name, items.map((i) => i.title)) };
            addCustom(c, freeCellNear(newAt.current.x, newAt.current.y), false);
            closeDialog();
          }}
        />
      )}
    </>
  );
}
