"use client";
import React, { useEffect, useRef } from "react";
import Draggable from "react-draggable";
import "7.css/dist/7.css";

// Centered Win7 dialog owned by the desktop itself (delete confirmations, Create Shortcut, errors).
// Draggable by its title bar; Esc presses Cancel.

const FONT = '9pt "Segoe UI", "SegoeUI", "Noto Sans", sans-serif';

export default function DesktopDialog({ title, width, onClose, titleExtra, children, footer, zIndex = 6000 }: {
  title: string;
  width: number;
  onClose: () => void;
  /** Rendered before the title text (wizard back button) */
  titleExtra?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  zIndex?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex, display: "flex",
      alignItems: "center", justifyContent: "center", pointerEvents: "none",
    }}>
      <Draggable nodeRef={ref as React.RefObject<HTMLElement>} handle=".title-bar" cancel="button, .win7-nav-btn">
        <div
          ref={ref}
          className="window active is-bright"
          role="dialog"
          aria-label={title}
          style={{ width, maxWidth: "calc(100vw - 16px)", pointerEvents: "auto", font: FONT }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="title-bar">
            <div className="title-bar-text" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {titleExtra}
              {title}
            </div>
            <div className="title-bar-controls">
              <button aria-label="Close" onClick={onClose} />
            </div>
          </div>
          <div className="window-body" style={{ padding: "12px 14px", font: FONT }}>
            {children}
          </div>
          <footer style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
            {footer}
          </footer>
        </div>
      </Draggable>
    </div>
  );
}
