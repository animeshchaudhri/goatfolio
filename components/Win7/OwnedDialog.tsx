"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Draggable from "react-draggable";
import { TitleBar, FONT } from "./Chrome";
import "7.css/dist/7.css";

// Secondary dialog owned by a window (Find, Font, Properties…). Rendered in a portal so it can
// leave the owner's bounds like a real Win7 owned window; `modal` blocks the owner and flashes on click.
export default function OwnedDialog({
  title, width, owner, zIndex, modal = true, bright = false, bodyStyle, onClose, onFocus, footer, children,
}: {
  title: string;
  width: number;
  /** Element the dialog is centred over */
  owner: React.RefObject<HTMLElement | null>;
  zIndex: number;
  modal?: boolean;
  /** White body + grey footer (message boxes, task dialogs) */
  bright?: boolean;
  bodyStyle?: React.CSSProperties;
  onClose: () => void;
  /** Called on any press inside the dialog, so the owner can raise itself */
  onFocus?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [ownerRect, setOwnerRect] = useState<DOMRect | null>(null);
  const [flash, setFlash] = useState(false);
  const small = typeof window !== "undefined" && window.innerWidth < 768;
  const w = typeof window !== "undefined" ? Math.min(width, window.innerWidth - 16) : width;

  // Centre over the owner once the dialog has measured itself
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = owner.current?.getBoundingClientRect();
    const h = el.offsetHeight;
    const cx = o ? o.left + o.width / 2 : window.innerWidth / 2;
    const cy = o ? o.top + Math.min(o.height, window.innerHeight) / 2.4 : window.innerHeight / 2.4;
    setPos({
      x: Math.round(Math.max(8, Math.min(cx - w / 2, window.innerWidth - w - 8))),
      y: Math.round(Math.max(8, Math.min(cy - h / 2, window.innerHeight - h - 48))),
    });
    if (o) setOwnerRect(o);
  }, [owner, w]);

  // Focus the first field once placed; hand focus back on close
  const placed = pos !== null;
  useEffect(() => {
    const el = ref.current;
    if (!placed || !el) return;
    const prev = document.activeElement as HTMLElement | null;
    (el.querySelector<HTMLElement>("[data-autofocus]")
      ?? el.querySelector<HTMLElement>("input:not([type=checkbox]):not([type=radio]), select, button:not([aria-label])"))?.focus({ preventScroll: true });
    return () => {
      if (prev?.isConnected && !prev.closest("[role=dialog]")) prev.focus({ preventScroll: true });
      else owner.current?.querySelector<HTMLElement>("textarea, input, [tabindex]")?.focus({ preventScroll: true });
    };
  }, [placed, owner]);

  const flashTitle = () => {
    let n = 0;
    const id = setInterval(() => { setFlash((f) => !f); if (++n >= 6) clearInterval(id); }, 70);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {modal && ownerRect && (
        <div
          onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); flashTitle(); }}
          style={{
            position: "fixed", left: ownerRect.left, top: ownerRect.top,
            width: ownerRect.width, height: ownerRect.height, zIndex: zIndex - 1,
          }}
        />
      )}
      <Draggable nodeRef={ref as React.RefObject<HTMLElement>} handle=".title-bar" cancel="button" disabled={small}>
        <div
          ref={ref}
          className={`window ${flash ? "" : "active"} ${bright ? "is-bright" : ""}`}
          role="dialog"
          aria-label={title}
          onPointerDown={onFocus}
          onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } }}
          style={{
            position: "fixed", left: pos?.x ?? -9999, top: pos?.y ?? 0, width: w,
            zIndex, fontFamily: FONT, fontSize: 12,
          }}
        >
          <TitleBar title={title} onClose={onClose} controls="close" />
          <div className="window-body" style={{ padding: 10, color: "#000", ...bodyStyle }}>{children}</div>
          {footer && (
            <footer style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>{footer}</footer>
          )}
        </div>
      </Draggable>
    </>,
    document.body
  );
}
