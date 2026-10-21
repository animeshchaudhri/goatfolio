"use client";
import React, { useEffect, useRef, useState } from "react";
import { FONT } from "../Win7/Chrome";

// Controlled Win7 (Aero) menu bar + drop-down menus. Labels use "&" to mark the mnemonic
// letter, which is underlined only while Alt is held, like Windows.

export type MenuItem =
  | { label: string; shortcut?: string; onClick: () => void; disabled?: boolean; checked?: boolean }
  | { separator: true };
export type Menu = { label: string; items: MenuItem[] };

const isSep = (i: MenuItem): i is { separator: true } => "separator" in i;
const mnemonicOf = (label: string) => label[label.indexOf("&") + 1]?.toLowerCase();

function Label({ text, cues }: { text: string; cues: boolean }) {
  const i = text.indexOf("&");
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span style={{ textDecoration: cues ? "underline" : "none" }}>{text[i + 1]}</span>
      {text.slice(i + 2)}
    </>
  );
}

export default function MenuBar({ menus, open, onOpenChange, cues }: {
  menus: Menu[];
  open: number | null;
  onOpenChange: (i: number | null) => void;
  cues: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<number | null>(null);
  const [active, setActive] = useState(-1);
  // a hover-switch followed by the click on the same title shouldn't toggle it shut
  const hoverOpened = useRef({ i: -1, at: 0 });

  useEffect(() => setActive(-1), [open]);

  // Close on outside press / Esc
  useEffect(() => {
    if (open === null) return;
    const down = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) onOpenChange(null); };
    const key = (e: KeyboardEvent) => {
      const items = menus[open].items;
      const enabled = items.map((it, i) => (!isSep(it) && !it.disabled ? i : -1)).filter((i) => i >= 0);
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onOpenChange(null); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const pos = enabled.indexOf(active);
        const next = e.key === "ArrowDown" ? enabled[(pos + 1) % enabled.length] : enabled[(pos - 1 + enabled.length) % enabled.length];
        setActive(next ?? -1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        onOpenChange((open + (e.key === "ArrowRight" ? 1 : menus.length - 1)) % menus.length);
      } else if (e.key === "Enter" && active >= 0) {
        e.preventDefault();
        const it = items[active];
        if (!isSep(it) && !it.disabled) { onOpenChange(null); it.onClick(); }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const it = items.find((it) => !isSep(it) && !it.disabled && mnemonicOf(it.label) === e.key.toLowerCase());
        if (it && !isSep(it)) { e.preventDefault(); onOpenChange(null); it.onClick(); }
      }
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("keydown", key, true);
    };
  }, [open, menus, active, onOpenChange]);

  return (
    <div
      ref={root}
      role="menubar"
      className="np-menubar"
      // keep focus (and the selection) in the document while using menus
      onMouseDown={(e) => e.preventDefault()}
      style={{
        display: "flex", alignItems: "center", height: 20, padding: "0 1px", flexShrink: 0,
        background: "linear-gradient(#fff 20%,#f1f4fa 25%,#f1f4fa 43%,#d4dbee 48%,#e6eaf6)",
        borderBottom: "1px solid #b6bccc",
        fontFamily: FONT, fontSize: 12, color: "#000", userSelect: "none", position: "relative", zIndex: 5,
      }}
    >
      {menus.map((m, i) => {
        const isOpen = open === i;
        const isHot = hot === i && open === null;
        return (
          <div key={m.label} style={{ position: "relative", height: "100%" }}>
            <div
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => {
                const h = hoverOpened.current;
                if (isOpen && h.i === i && Date.now() - h.at < 500) return;
                onOpenChange(isOpen ? null : i);
              }}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                setHot(i);
                if (open !== null && open !== i) { hoverOpened.current = { i, at: Date.now() }; onOpenChange(i); }
              }}
              onPointerLeave={() => setHot(null)}
              style={{
                height: "100%", display: "flex", alignItems: "center", padding: "0 6px",
                boxSizing: "border-box", borderRadius: 3, cursor: "default",
                border: isOpen ? "1px solid #8ea6c5" : isHot ? "1px solid #b8d6fb" : "1px solid transparent",
                background: isOpen
                  ? "linear-gradient(#dbe6f4,#c7d8ee 50%,#bdd0ea 50%,#cddcf0)"
                  : isHot ? "linear-gradient(180deg,#fff9,#e6ecf5cc 90%,#fffc)" : "transparent",
                boxShadow: isOpen ? "inset 0 1px 2px rgba(0,0,0,.18)" : "none",
              }}
            >
              <Label text={m.label} cues={cues} />
            </div>

            {isOpen && (
              <div
                role="menu"
                style={{
                  position: "absolute", top: "100%", left: 0, marginTop: -1, minWidth: 180,
                  background: "#f0f0f0", border: "1px solid #979797", padding: 2,
                  boxShadow: "3px 3px 3px -1px rgba(0,0,0,.35)",
                }}
              >
                {/* icon gutter */}
                <div style={{
                  position: "absolute", top: 2, bottom: 2, left: 28, width: 2,
                  boxShadow: "inset 1px 0 #e2e3e3, inset -1px 0 #fff", pointerEvents: "none",
                }} />
                {m.items.map((it, j) => isSep(it) ? (
                  <div key={`sep-${j}`} style={{
                    height: 2, margin: "3px 0 3px 30px",
                    boxShadow: "inset 0 1px #e2e3e3, inset 0 -1px #fff",
                  }} />
                ) : (
                  <div
                    key={it.label}
                    role="menuitem"
                    aria-disabled={it.disabled || undefined}
                    onPointerEnter={() => setActive(j)}
                    onPointerLeave={() => setActive(-1)}
                    onClick={() => { if (it.disabled) return; onOpenChange(null); it.onClick(); }}
                    style={{
                      position: "relative", display: "flex", alignItems: "center", gap: 32,
                      height: 22, padding: "0 20px 0 32px", boxSizing: "border-box",
                      whiteSpace: "nowrap", borderRadius: 3, cursor: "default",
                      color: it.disabled ? "#6d6d6d" : "#000",
                      border: active === j ? `1px solid ${it.disabled ? "#d9d9d9" : "#b8d6fb"}` : "1px solid transparent",
                      background: active === j && !it.disabled ? "linear-gradient(180deg,#fff9,#e6ecf5cc 90%,#fffc)" : "transparent",
                    }}
                  >
                    {it.checked && (
                      <span style={{
                        position: "absolute", left: 2, top: 0, width: 20, height: 20, boxSizing: "border-box",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 3, border: "1px solid #b3d3f9",
                        background: "linear-gradient(180deg,#fff9,#e6ecf5cc 90%,#fffc)",
                        color: "#0c12a1", fontSize: 11, fontWeight: 700,
                      }}>✓</span>
                    )}
                    <span style={{ flex: 1 }}><Label text={it.label} cues={cues} /></span>
                    {it.shortcut && <span>{it.shortcut}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { mnemonicOf };
