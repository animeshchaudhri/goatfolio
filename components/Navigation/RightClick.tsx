"use client";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Windows 7 context menu: gutter + icons, check/radio marks, cascading submenus that
// open on hover (or tap), flip to stay on screen, and close on pick / outside click / Esc.
// Rendered into <body> so draggable windows/gadgets around the opener never see its events.

export type MenuItem = {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  /** Check mark in the gutter (or a bullet when `radio`) */
  checked?: boolean;
  radio?: boolean;
  icon?: string;
  /** Default action, drawn bold */
  bold?: boolean;
  submenu?: MenuEntry[];
};
export type MenuEntry = MenuItem | "separator";

const FONT = '9pt "Segoe UI", "SegoeUI", "Noto Sans", sans-serif';
const GUTTER = 28;
const HOVER_DELAY = 350;

const isItem = (e: MenuEntry): e is MenuItem => e !== "separator";

function Mark({ item }: { item: MenuItem }) {
  if (!item.checked) return null;
  return (
    <span style={{
      position: "absolute", left: 1, top: 0, width: 22, height: 20,
      borderRadius: 3, boxShadow: "0 0 0 1px #b3d3f9",
      background: "linear-gradient(180deg,#fff9,#e6ecf5cc 90%,#fffc)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {item.radio ? (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "radial-gradient(circle at 70% 30%,#d5d4ea,#333583)",
          border: "1px solid #1a1490",
        }} />
      ) : (
        <svg width="9" height="9" viewBox="0 0 9 9">
          <path d="M1 4.6 3.4 7 8 1.6" fill="none" stroke="#0c12a1" strokeWidth="1.6" />
        </svg>
      )}
    </span>
  );
}

function MenuList({
  items, x, y, anchor, level, hover, onHover, onOpen, onPick, itemRef,
}: {
  items: MenuEntry[];
  x?: number; y?: number;
  /** Submenus position themselves next to this item rect */
  anchor?: DOMRect;
  level: number;
  hover: number | null;
  onHover: (level: number, index: number | null) => void;
  onOpen: (level: number, index: number, immediate: boolean) => void;
  onPick: (item: MenuItem) => void;
  itemRef: (level: number, index: number, el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { width: w, height: h } = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    let left: number, top: number;
    if (anchor) {
      left = anchor.right - 3;
      if (left + w > vw) left = anchor.left - w + 3;
      top = anchor.top - 3;
      if (top + h > vh) top = vh - h - 2;
    } else {
      left = x! + w > vw ? x! - w : x!;
      top = y! + h > vh ? y! - h : y!;
    }
    setPos({ left: Math.max(0, left), top: Math.max(0, top) });
  }, [x, y, anchor]);

  return (
    <div
      ref={ref}
      data-win7-menu=""
      role="menu"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed", left: pos?.left ?? 0, top: pos?.top ?? 0,
        visibility: pos ? "visible" : "hidden",
        zIndex: 10000 + level,
        minWidth: 168, padding: 2,
        background: "#f0f0f0", border: "1px solid #979797",
        boxShadow: "3px 3px 3px -1px rgba(0,0,0,0.45)",
        font: FONT, color: "#000", cursor: "default", userSelect: "none",
      }}
    >
      {/* icon gutter */}
      <div style={{
        position: "absolute", left: GUTTER, top: 2, bottom: 2, width: 2, pointerEvents: "none",
        boxShadow: "inset 1px 0 rgba(0,0,0,.15), inset -1px 0 #fff",
      }} />
      {items.map((entry, i) =>
        entry === "separator" ? (
          <div key={`sep-${i}`} style={{
            height: 2, margin: `3px 0 3px ${GUTTER + 2}px`,
            boxShadow: "inset 0 1px rgba(0,0,0,.15), inset 0 -1px #fff",
          }} />
        ) : (
          <div
            key={entry.label}
            ref={(el) => itemRef(level, i, el)}
            role="menuitem"
            aria-disabled={entry.disabled || undefined}
            aria-haspopup={entry.submenu ? "true" : undefined}
            onMouseEnter={() => { onHover(level, i); onOpen(level, i, false); }}
            onMouseLeave={() => { if (!entry.submenu) onHover(level, null); }}
            onClick={(e) => {
              e.stopPropagation();
              if (entry.disabled) return;
              if (entry.submenu) onOpen(level, i, true);
              else onPick(entry);
            }}
            style={{
              position: "relative", height: 20, lineHeight: "20px",
              padding: `0 26px 0 ${GUTTER + 6}px`,
              borderWidth: 1, borderStyle: "solid", borderRadius: 3,
              whiteSpace: "nowrap",
              fontWeight: entry.bold ? 700 : 400,
              color: entry.disabled ? "#8d8d8d" : "#000",
              ...(hover !== i
                ? { borderColor: "transparent", background: "transparent" }
                : entry.disabled
                ? { borderColor: "#dadada", background: "linear-gradient(180deg,#fafafa,#ececec)" }
                : { borderColor: "#b8d6fb", background: "linear-gradient(180deg,#fff9,#e6ecf5cc 90%,#fffc)" }),
            }}
          >
            <Mark item={entry} />
            {entry.icon && !entry.checked && (
              <img src={entry.icon} width={16} height={16} alt="" style={{
                position: "absolute", left: 5, top: 2, pointerEvents: "none",
                opacity: entry.disabled ? 0.5 : 1,
              }} />
            )}
            {entry.label}
            {entry.submenu && (
              <span style={{
                position: "absolute", right: 7, top: 6, width: 0, height: 0,
                borderTop: "4px solid transparent", borderBottom: "4px solid transparent",
                borderLeft: "4px solid currentColor",
              }} />
            )}
          </div>
        )
      )}
    </div>
  );
}

export default function ContextMenu({ x, y, items, onClose }: {
  x: number; y: number; items: MenuEntry[]; onClose: () => void;
}) {
  // open[i] = index of the item at level i whose submenu is showing
  const [open, setOpen] = useState<number[]>([]);
  const [hover, setHover] = useState<(number | null)[]>([null]);
  const items$ = useRef(new Map<string, HTMLDivElement>());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const levels: MenuEntry[][] = [items];
  for (const idx of open) {
    const parent = levels[levels.length - 1][idx];
    if (!parent || !isItem(parent) || !parent.submenu) break;
    levels.push(parent.submenu);
  }

  const pick = useCallback((item: MenuItem) => {
    onClose();
    item.onSelect?.();
  }, [onClose]);

  const openAt = useCallback((level: number, index: number, immediate: boolean) => {
    clearTimeout(timer.current);
    const entry = levels[level]?.[index];
    const apply = () => setOpen((o) => {
      const next = o.slice(0, level);
      if (entry && isItem(entry) && entry.submenu && !entry.disabled) next.push(index);
      return next;
    });
    if (immediate) apply();
    else timer.current = setTimeout(apply, HOVER_DELAY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, open]);

  const hoverAt = useCallback((level: number, index: number | null) => {
    setHover((h) => { const n = h.slice(0, level + 1); n[level] = index; return n; });
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.("[data-win7-menu]")) onClose();
    };
    const key = (e: KeyboardEvent) => {
      const deepest = levels.length - 1;
      const list = levels[deepest];
      const cur = hover[deepest] ?? null;
      const step = (dir: 1 | -1) => {
        let i = cur ?? (dir === 1 ? -1 : list.length);
        for (let n = 0; n < list.length; n++) {
          i = (i + dir + list.length) % list.length;
          if (isItem(list[i])) return i;
        }
        return cur;
      };
      if (e.key === "Escape") {
        e.preventDefault();
        if (open.length) setOpen((o) => o.slice(0, -1)); else onClose();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        hoverAt(deepest, step(e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "ArrowRight" && cur !== null) {
        const entry = list[cur];
        if (isItem(entry) && entry.submenu && !entry.disabled) {
          e.preventDefault();
          setOpen((o) => [...o.slice(0, deepest), cur]);
          hoverAt(deepest + 1, entry.submenu.findIndex(isItem));
        }
      } else if (e.key === "ArrowLeft" && open.length) {
        e.preventDefault();
        setOpen((o) => o.slice(0, -1));
      } else if (e.key === "Enter" && cur !== null) {
        const entry = list[cur];
        e.preventDefault();
        if (!isItem(entry) || entry.disabled) return;
        if (entry.submenu) { setOpen((o) => [...o.slice(0, deepest), cur]); hoverAt(deepest + 1, entry.submenu.findIndex(isItem)); }
        else pick(entry);
      }
    };
    const close = () => onClose();
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("keydown", key);
    window.addEventListener("resize", close);
    window.addEventListener("blur", close);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", close);
      window.removeEventListener("blur", close);
    };
  });

  return createPortal(
    <>
      {levels.map((list, level) => (
        <MenuList
          key={level === 0 ? "root" : `${level}-${open[level - 1]}`}
          items={list}
          x={level === 0 ? x : undefined}
          y={level === 0 ? y : undefined}
          anchor={level === 0 ? undefined : items$.current.get(`${level - 1}:${open[level - 1]}`)?.getBoundingClientRect()}
          level={level}
          hover={level < open.length ? open[level] : hover[level] ?? null}
          onHover={hoverAt}
          onOpen={openAt}
          onPick={pick}
          itemRef={(l, i, el) => {
            const k = `${l}:${i}`;
            if (el) items$.current.set(k, el); else items$.current.delete(k);
          }}
        />
      ))}
    </>,
    document.body,
  );
}
