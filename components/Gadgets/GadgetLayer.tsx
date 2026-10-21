"use client";
import React, { useRef, useState } from "react";
import ContextMenu from "../Navigation/RightClick";
import { useDesktop } from "../Desktop/DesktopContext";
import { GADGET_SIZE, useGadgets, type GadgetInstance } from "./GadgetsContext";
import { gadgetDef } from "./registry";

// Gadgets docked on the desktop: drag anywhere, hover (or tap) for the Close / drag toolbar,
// right-click (or long-press) for the gadget menu.

const TASKBAR_H = 40;

function Toolbar({ onRight, onClose, onGripDown }: {
  onRight: boolean;
  onClose: () => void;
  onGripDown: (e: React.PointerEvent) => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      data-gadget-toolbar=""
      style={{
        position: "absolute", top: 0, [onRight ? "left" : "right"]: "calc(100% + 2px)",
        width: 16, padding: "2px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        background: "linear-gradient(90deg,rgba(250,250,250,.94),rgba(222,222,222,.94))",
        border: "1px solid rgba(0,0,0,.38)", borderRadius: 3,
        boxShadow: "0 1px 3px rgba(0,0,0,.35)",
      }}
    >
      <button
        type="button"
        aria-label="Close"
        title="Close"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          all: "unset",
          width: 13, height: 13, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", background: hov ? "linear-gradient(180deg,#e8a493,#c74a2f)" : "transparent",
          boxShadow: hov ? "inset 0 0 0 1px #8a2a19" : "none",
        }}
      >
        <svg width="7" height="7" viewBox="0 0 7 7">
          <path d="M1 1l5 5M6 1 1 6" stroke={hov ? "#fff" : "#333"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Drag gadget"
        title="Drag gadget"
        onPointerDown={onGripDown}
        style={{ all: "unset", width: 13, height: 15, cursor: "move", display: "grid", gridTemplateColumns: "repeat(2, 2px)", gap: 2, justifyContent: "center", alignContent: "center" }}
      >
        {Array.from({ length: 6 }, (_, i) => <span key={i} style={{ width: 2, height: 2, background: "#6a6a6a", boxShadow: "1px 1px 0 #fff" }} />)}
      </button>
    </div>
  );
}

function Gadget({ g, active, setActive }: { g: GadgetInstance; active: boolean; setActive: (id: string | null) => void }) {
  const { removeGadget, moveGadget } = useGadgets();
  const { openApp } = useDesktop();
  const { w, h } = GADGET_SIZE[g.kind];
  const { Component, name } = gadgetDef(g.kind);
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState<{ right: number; top: number } | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; right: number; top: number; moved: boolean; id: number } | null>(null);
  const press = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suppressClick = useRef(false);

  const down = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, right: g.right, top: g.top, moved: false, id: e.pointerId };
    suppressClick.current = false;
    if (e.pointerType !== "mouse") {
      const { clientX: x, clientY: y } = e;
      press.current = setTimeout(() => {
        if (start.current && !start.current.moved) {
          start.current = null;
          suppressClick.current = true;
          setMenu({ x, y });
        }
      }, 500);
    }
  };
  const move = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!s.moved && Math.hypot(dx, dy) < (e.pointerType === "mouse" ? 3 : 8)) return;
    if (!s.moved) e.currentTarget.setPointerCapture(e.pointerId); // only now, so plain clicks keep their target
    s.moved = true;
    clearTimeout(press.current);
    setDrag({
      right: Math.min(Math.max(0, s.right - dx), window.innerWidth - w),
      top: Math.min(Math.max(0, s.top + dy), window.innerHeight - TASKBAR_H - h),
    });
  };
  const up = (e: React.PointerEvent) => {
    clearTimeout(press.current);
    const s = start.current;
    start.current = null;
    if (!s || s.id !== e.pointerId) return;
    if (s.moved && drag) {
      suppressClick.current = true;
      moveGadget(g.id, drag.right, drag.top);
    } else if (e.pointerType !== "mouse") {
      setActive(active ? null : g.id);
    }
    setDrag(null);
  };

  const pos = drag ?? g;
  const showBar = (hover || active || !!drag) && !menu;

  return (
    <>
    <div
      data-gadget=""
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClickCapture={(e) => {
        if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); suppressClick.current = false; }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (e.nativeEvent instanceof PointerEvent && e.nativeEvent.pointerType === "touch") return;
        setMenu({ x: e.clientX, y: e.clientY });
      }}
      aria-label={name}
      style={{
        position: "absolute", right: pos.right, top: pos.top, width: w, height: h, zIndex: drag ? 61 : 50,
        touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
      }}
    >
      <Component />
      {showBar && (
        <Toolbar
          onRight={pos.right >= 22}
          onClose={() => removeGadget(g.id)}
          onGripDown={(e) => { e.stopPropagation(); down(e); }}
        />
      )}
    </div>
    {menu && (
      <ContextMenu
        x={menu.x}
        y={menu.y}
        onClose={() => setMenu(null)}
        items={[
          { label: "Add gadgets...", onSelect: () => openApp("Gadgets") },
          "separator",
          { label: "Close gadget", onSelect: () => removeGadget(g.id) },
        ]}
      />
    )}
    </>
  );
}

export default function GadgetLayer() {
  const { gadgets, showGadgets } = useGadgets();
  const [active, setActive] = useState<string | null>(null);
  if (!showGadgets) return null;
  return (
    <>
      {gadgets.map((g) => (
        <Gadget key={g.id} g={g} active={active === g.id} setActive={setActive} />
      ))}
    </>
  );
}
