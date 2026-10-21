"use client";
import React, { useId } from "react";
import OwnedDialog from "./OwnedDialog";
import "7.css/dist/7.css";

// Small building blocks for Win7 dialogs: message-box icons, 7.css checkbox/radio wrappers,
// a Win32-style list box and a MessageBox.

// ─── 32px message box icons ──────────────────────────────────────────────────
export function MsgIcon({ kind, size = 32 }: { kind: "info" | "warning" | "error" | "question"; size?: number }) {
  if (kind === "warning") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="mbw" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe873" /><stop offset=".55" stopColor="#f7c600" /><stop offset="1" stopColor="#e9a400" />
          </linearGradient>
        </defs>
        <path d="M16 2.5c.9 0 1.6.5 2 1.2l12.6 23.1c.8 1.5-.2 3.2-1.9 3.2H3.3c-1.7 0-2.7-1.7-1.9-3.2L14 3.7c.4-.7 1.1-1.2 2-1.2z" fill="url(#mbw)" stroke="#b07800" />
        <rect x="14.4" y="10" width="3.2" height="11" rx="1.4" fill="#1d1d1d" />
        <circle cx="16" cy="25.2" r="1.9" fill="#1d1d1d" />
      </svg>
    );
  }
  const fill = kind === "error" ? ["#ff8a72", "#e2261b", "#a80d06"] : ["#7ec5ff", "#1f78d8", "#0b4ea8"];
  const id = `mb-${kind}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id={id} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor={fill[0]} /><stop offset=".6" stopColor={fill[1]} /><stop offset="1" stopColor={fill[2]} />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill={`url(#${id})`} stroke={fill[2]} />
      <ellipse cx="16" cy="9" rx="10" ry="5.5" fill="#fff" opacity=".28" />
      {kind === "info" && (<>
        <circle cx="16" cy="9.6" r="2.2" fill="#fff" />
        <rect x="14" y="13.4" width="4" height="11" rx="1.2" fill="#fff" />
      </>)}
      {kind === "question" && (
        <text x="16" y="23" textAnchor="middle" fontSize="19" fontWeight="700" fill="#fff" fontFamily="Segoe UI,Arial,sans-serif">?</text>
      )}
      {kind === "error" && (
        <path d="M10.5 10.5l11 11M21.5 10.5l-11 11" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      )}
    </svg>
  );
}

// ─── 7.css checkbox / radio (need an input + label pair) ─────────────────────
export function Check({ label, checked, onChange, disabled }: {
  label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  const id = useId();
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}</label>
    </span>
  );
}

export function Radio({ label, checked, onChange, disabled, name }: {
  label: React.ReactNode; checked: boolean; onChange: () => void; disabled?: boolean; name: string;
}) {
  const id = useId();
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <input id={id} type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </span>
  );
}

// ─── Win32 list box: white, sunken border, solid #3399ff selection ───────────
export function ListBox<T extends string | number>({ items, value, onChange, height, render, onActivate }: {
  items: T[];
  value: T | null;
  onChange: (v: T) => void;
  height: number;
  render?: (v: T) => React.ReactNode;
  onActivate?: (v: T) => void;
}) {
  return (
    <div
      role="listbox"
      tabIndex={0}
      onKeyDown={(e) => {
        const i = value === null ? -1 : items.indexOf(value);
        if (e.key === "ArrowDown" && i < items.length - 1) { e.preventDefault(); onChange(items[i + 1]); }
        if (e.key === "ArrowUp" && i > 0) { e.preventDefault(); onChange(items[i - 1]); }
        if (e.key === "Enter" && value !== null) onActivate?.(value);
      }}
      style={{
        height, overflowY: "auto", background: "#fff",
        border: "1px solid #828790", userSelect: "none", outline: "none",
      }}
    >
      {items.map((it) => (
        <div
          key={String(it)}
          role="option"
          aria-selected={it === value}
          ref={(el) => { if (el && it === value) el.scrollIntoView({ block: "nearest" }); }}
          onClick={() => onChange(it)}
          onDoubleClick={() => onActivate?.(it)}
          style={{
            padding: "0 3px", lineHeight: "16px", whiteSpace: "nowrap", cursor: "default",
            background: it === value ? "#3399ff" : "transparent",
            color: it === value ? "#fff" : "#000",
          }}
        >
          {render ? render(it) : it}
        </div>
      ))}
    </div>
  );
}

// ─── Message box (white body, grey footer, icon + text) ──────────────────────
export function MessageBox({ title, icon, text, owner, zIndex, onClose, buttons }: {
  title: string;
  icon?: "info" | "warning" | "error" | "question";
  text: React.ReactNode;
  owner: React.RefObject<HTMLElement | null>;
  zIndex: number;
  onClose: () => void;
  /** Defaults to a single OK */
  buttons?: { label: string; onClick: () => void; default?: boolean }[];
}) {
  const btns = buttons ?? [{ label: "OK", onClick: onClose, default: true }];
  return (
    <OwnedDialog
      title={title} width={360} owner={owner} zIndex={zIndex} bright onClose={onClose}
      footer={btns.map((b) => (
        <button key={b.label} className={b.default ? "default" : undefined} data-autofocus={b.default || undefined} onClick={b.onClick}>
          {b.label}
        </button>
      ))}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 4px 14px", minHeight: 40 }}>
        {icon && <MsgIcon kind={icon} />}
        <div style={{ paddingTop: icon ? 7 : 0, lineHeight: 1.45, wordBreak: "break-word" }}>{text}</div>
      </div>
    </OwnedDialog>
  );
}
