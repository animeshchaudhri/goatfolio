"use client";
import React, { useRef, useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { TitleBar, FONT, itemStyle } from "./Chrome";
import ContextMenu from "../Navigation/RightClick";
import { useGadgets, GADGET_SIZE } from "../Gadgets/GadgetsContext";
import { GADGETS, type GadgetDef } from "../Gadgets/registry";
import type { WindowProps } from "../Desktop/windows";

// Win7 Gadget Gallery: glass window, page + search strip, tile grid, Show details pane.
// Double-click (double-tap) or right-click ▸ Add puts a gadget on the desktop.

function Preview({ def, box }: { def: GadgetDef; box: number }) {
  const { w, h } = GADGET_SIZE[def.kind];
  const s = Math.min(box / w, box / h);
  return (
    <div style={{ width: box, height: box, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ width: w * s, height: h * s }}>
        <div style={{ width: w, height: h, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          <def.Component preview />
        </div>
      </div>
    </div>
  );
}

function Tile({ def, selected, onSelect, onAdd, onMenu }: {
  def: GadgetDef;
  selected: boolean;
  onSelect: () => void;
  onAdd: () => void;
  onMenu: (x: number, y: number) => void;
}) {
  const [hov, setHov] = useState(false);
  const lastTap = useRef(0);
  return (
    <div
      role="option"
      aria-selected={selected}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onPointerDown={onSelect}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") return;
        const now = Date.now();
        if (now - lastTap.current < 450) { lastTap.current = 0; onAdd(); } else lastTap.current = now;
      }}
      onDoubleClick={onAdd}
      onContextMenu={(e) => { e.preventDefault(); onSelect(); onMenu(e.clientX, e.clientY); }}
      style={{
        width: 96, height: 100, boxSizing: "border-box", borderRadius: 3,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
        paddingTop: 6, gap: 6, cursor: "default", userSelect: "none",
        ...itemStyle(selected, hov),
      }}
    >
      <Preview def={def} box={64} />
      <span style={{ fontSize: 12, color: "#1e1e1e", textAlign: "center", lineHeight: "14px" }}>{def.name}</span>
    </div>
  );
}

function PageArrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <button
      aria-label={dir === "prev" ? "Previous page" : "Next page"}
      disabled
      style={{ minWidth: 0, width: 22, height: 20, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <svg width="6" height="8" viewBox="0 0 6 8">
        <path d={dir === "prev" ? "M6 0 0 4 6 8z" : "M0 0 6 4 0 8z"} fill="#9a9a9a" />
      </svg>
    </button>
  );
}

export default function Gadgets({ onClose, zIndex, onFocus, minimized, onMinimize }: WindowProps) {
  const { addGadget } = useGadgets();
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const shown = GADGETS.filter((g) => g.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = GADGETS.find((g) => g.kind === sel);

  return (
    <DraggableWindow
      cancelSelector=".gadget-gallery-body, .gadget-gallery-search"
      zIndex={zIndex}
      width="600px"
      height="430px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      resizable={false}
      className="window active"
    >
      <TitleBar title="" onClose={onClose} controls="close" />

      {/* Page + search strip on the glass */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 8px", flexShrink: 0,
        fontFamily: FONT, fontSize: 12, color: "#1e1e1e",
      }}>
        <span>Page 1 of 1</span>
        <PageArrow dir="prev" />
        <PageArrow dir="next" />
        <div className="gadget-gallery-search" style={{
          marginLeft: "auto", width: 210, maxWidth: "50%", height: 22, boxSizing: "border-box",
          display: "flex", alignItems: "center", gap: 4, padding: "0 5px",
          background: "#fff", border: "1px solid #8e9dad", borderRadius: 2,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,.12)",
        }}>
          <input
            aria-label="Search gadgets"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gadgets"
            style={{
              all: "unset", flex: 1, minWidth: 0, fontFamily: FONT, fontSize: 12,
              color: "#1e1e1e", fontStyle: query ? "normal" : "italic",
            }}
          />
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
            <circle cx="5" cy="5" r="3.5" fill="none" stroke="#7a7a7a" strokeWidth="1.3" />
            <path d="M7.7 7.7 11 11" stroke="#7a7a7a" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Tiles */}
      <div
        className="gadget-gallery-body"
        role="listbox"
        aria-label="Gadgets"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" && selected) addGadget(selected.kind); }}
        onPointerDown={(e) => { if (e.target === e.currentTarget) setSel(null); }}
        style={{
          flex: 1, minHeight: 0, overflowY: "auto", margin: "0 6px", outline: "none",
          background: "#fff", border: "1px solid #8193a7",
          boxShadow: "0 0 0 1px rgba(255,255,255,.6)",
          display: "flex", flexWrap: "wrap", alignContent: "flex-start", gap: 4, padding: 8,
          fontFamily: FONT,
        }}
      >
        {shown.map((g) => (
          <Tile
            key={g.kind}
            def={g}
            selected={sel === g.kind}
            onSelect={() => setSel(g.kind)}
            onAdd={() => addGadget(g.kind)}
            onMenu={(x, y) => setMenu({ x, y })}
          />
        ))}
        {!shown.length && (
          <div style={{ width: "100%", textAlign: "center", color: "#6d6d6d", fontSize: 12, marginTop: 30 }}>
            No gadgets match your search.
          </div>
        )}
      </div>

      {details && (
        <div className="gadget-gallery-body" style={{
          height: 104, flexShrink: 0, margin: "0 6px", boxSizing: "border-box",
          background: "#fff", border: "1px solid #8193a7", borderTop: "none",
          display: "flex", alignItems: "center", gap: 14, padding: "0 14px",
          fontFamily: FONT, fontSize: 12, color: "#1e1e1e",
        }}>
          {selected ? (
            <>
              <Preview def={selected} box={84} />
              <div style={{ lineHeight: "18px", minWidth: 0 }}>
                <div style={{ fontSize: 15, color: "#1e3287" }}>{selected.name}</div>
                <div style={{ color: "#5a5a5a" }}>Version: 1.0.0.0</div>
                <div>{selected.description}</div>
              </div>
            </>
          ) : (
            <div style={{ color: "#6d6d6d" }}>Select a gadget to see its details.</div>
          )}
        </div>
      )}

      {/* Show details strip on the glass */}
      <div style={{ height: 30, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 8px", fontFamily: FONT, fontSize: 12 }}>
        <button
          onClick={() => setDetails((d) => !d)}
          aria-expanded={details}
          style={{
            all: "unset", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#1e1e1e",
          }}
        >
          <span style={{
            width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(180deg,#ffffff 0%,#e3e8ee 50%,#cfd6de 51%,#eef1f4 100%)",
            border: "1px solid #8794a3", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.7)",
          }}>
            <svg width="8" height="6" viewBox="0 0 8 6" style={{ transform: details ? "rotate(180deg)" : undefined }}>
              <path d="M.8 .8 4 4.2 7.2 .8" fill="none" stroke="#3b4a5c" strokeWidth="1.4" />
            </svg>
          </span>
          {details ? "Hide details" : "Show details"}
        </button>
      </div>

      {menu && selected && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { label: "Add", bold: true, onSelect: () => addGadget(selected.kind) },
            { label: "Uninstall", disabled: true },
          ]}
        />
      )}
    </DraggableWindow>
  );
}
