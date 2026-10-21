import type { App } from "../Desktop/apps";
import { ICONS } from "./icons";

// Desktop icon model: what's on the desktop, how it's laid out, and how View / Sort by behave.

export type IconSize = "large" | "medium" | "small";
export type SortKey = "name" | "size" | "type" | "date";

export interface ViewSettings {
  size: IconSize;
  autoArrange: boolean;
  alignToGrid: boolean;
  showIcons: boolean;
  sort?: { key: SortKey; desc: boolean };
}

export const DEFAULT_VIEW: ViewSettings = { size: "large", autoArrange: false, alignToGrid: true, showIcons: true };

export type CustomKind = "folder" | "text" | "shortcut";

/** Persisted user-created item */
export interface CustomItem {
  id: string;
  kind: CustomKind;
  title: string;
  created: number;
  /** What a shortcut opens: an APPS/ACTIONS name or an ad-hoc App */
  target?: string | App;
  /** Icon for shortcuts (the target's icon) */
  img?: string;
}

export interface DesktopItem {
  id: string;
  title: string;
  img: string;
  /** System icons (Computer, Recycle Bin) always sort first, like Win7 */
  system: boolean;
  custom?: CustomItem;
  overlay: boolean;
  size: number;
  type: string;
  modified: number;
}

const SYSTEM = ["Computer", "Recycle Bin"];
const BUILTIN_DATE = Date.UTC(2026, 3, 22, 4, 54);

export function builtinItems(icons: { title: string; img: string }[]): DesktopItem[] {
  return icons.map((icon, i) => ({
    id: icon.title,
    title: icon.title,
    img: icon.img,
    system: SYSTEM.includes(icon.title),
    overlay: false,
    size: SYSTEM.includes(icon.title) ? 0 : 1024 + icon.title.length * 97,
    type: SYSTEM.includes(icon.title) ? "System Folder" : icon.title === "My Projects" ? "File folder" : "Shortcut",
    modified: BUILTIN_DATE - i * 86_400_000,
  }));
}

const KIND_INFO: Record<CustomKind, { img: string; type: string; size: number }> = {
  folder:   { img: ICONS.folder,           type: "File folder",   size: 0 },
  text:     { img: ICONS.textDocument,     type: "Text Document", size: 0 },
  shortcut: { img: ICONS.internetShortcut, type: "Shortcut",      size: 1210 },
};

export function customToItem(c: CustomItem): DesktopItem {
  const info = KIND_INFO[c.kind];
  return {
    id: c.id,
    title: c.title,
    img: c.img ?? info.img,
    system: false,
    custom: c,
    overlay: c.kind === "shortcut",
    size: info.size,
    type: typeof c.target === "object" ? "Internet Shortcut" : info.type,
    modified: c.created,
  };
}

/** "New folder", "New folder (2)", … — first name not already on the desktop */
export function uniqueName(base: string, taken: string[]): string {
  const lower = new Set(taken.map((t) => t.toLowerCase()));
  if (!lower.has(base.toLowerCase())) return base;
  for (let n = 2; ; n++) {
    const name = `${base} (${n})`;
    if (!lower.has(name.toLowerCase())) return name;
  }
}

export function sortItems(items: DesktopItem[], key: SortKey, desc: boolean): string[] {
  const cmp = (a: DesktopItem, b: DesktopItem) => {
    const byName = a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true });
    const r =
      key === "name" ? byName :
      key === "size" ? a.size - b.size || byName :
      key === "type" ? a.type.localeCompare(b.type) || byName :
      a.modified - b.modified || byName;
    return desc ? -r : r;
  };
  const system = items.filter((i) => i.system).sort((a, b) => SYSTEM.indexOf(a.id) - SYSTEM.indexOf(b.id));
  return [...system, ...items.filter((i) => !i.system).sort(cmp)].map((i) => i.id);
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export interface Metrics { icon: number; cellW: number; cellH: number; boxW: number }

export const METRICS: Record<IconSize, Metrics> = {
  large:  { icon: 48, cellW: 92,  cellH: 98, boxW: 84 },
  medium: { icon: 32, cellW: 76,  cellH: 78, boxW: 72 },
  small:  { icon: 16, cellW: 150, cellH: 22, boxW: 146 },
};

export const ORIGIN = { x: 4, y: 6 };
export const TASKBAR_H = 40;

/** Fractional grid coordinates, so positions survive icon-size changes */
export type Cell = { col: number; row: number };

export const cellToPx = (c: Cell, m: Metrics) => ({ x: ORIGIN.x + c.col * m.cellW, y: ORIGIN.y + c.row * m.cellH });
export const pxToCell = (x: number, y: number, m: Metrics): Cell => ({ col: (x - ORIGIN.x) / m.cellW, row: (y - ORIGIN.y) / m.cellH });

export function gridSize(m: Metrics, w: number, h: number) {
  return {
    rows: Math.max(1, Math.floor((h - TASKBAR_H - ORIGIN.y) / m.cellH)),
    cols: Math.max(1, Math.floor((w - ORIGIN.x) / m.cellW)),
  };
}

const key = (c: Cell) => `${Math.round(c.col)}:${Math.round(c.row)}`;

/** Nearest cell (by distance from `c`) that isn't in `taken` */
export function nearestFree(c: Cell, taken: Set<string>, rows: number, cols: number): Cell {
  let best: Cell | null = null, bestD = Infinity;
  for (let col = 0; col < cols; col++)
    for (let row = 0; row < rows; row++) {
      if (taken.has(`${col}:${row}`)) continue;
      const d = (col - c.col) ** 2 + (row - c.row) ** 2;
      if (d < bestD) { bestD = d; best = { col, row }; }
    }
  return best ?? { col: 0, row: 0 };
}

/**
 * Where every icon goes. Auto arrange fills columns top-to-bottom in `order`; otherwise
 * icons keep their saved cell and the rest take the next free cells in order.
 */
export function layout(
  order: string[], positions: Record<string, Cell>, autoArrange: boolean, rows: number, cols: number,
): Record<string, Cell> {
  const out: Record<string, Cell> = {};
  if (autoArrange) {
    order.forEach((id, i) => { out[id] = { col: Math.floor(i / rows), row: i % rows }; });
    return out;
  }
  const taken = new Set<string>();
  for (const id of order) {
    const p = positions[id];
    if (p && p.row >= -0.5 && p.row <= rows - 0.5 && p.col >= -0.5 && p.col <= cols - 0.5) {
      out[id] = p;
      taken.add(key(p));
    }
  }
  let next = 0;
  for (const id of order) {
    if (out[id]) continue;
    while (taken.has(`${Math.floor(next / rows)}:${next % rows}`)) next++;
    out[id] = { col: Math.floor(next / rows), row: next % rows };
    taken.add(key(out[id]));
  }
  return out;
}

export function loadJSON<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function loadArray<T>(k: string): T[] {
  try {
    const v = JSON.parse(localStorage.getItem(k) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
