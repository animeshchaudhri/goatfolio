"use client";
import React, { useEffect, useState } from "react";

// Win7 Calendar gadget: day page (weekday, big date, month) — click to flip to the month grid.

const FONT = '"Segoe UI", "SegoeUI", "Noto Sans", sans-serif';
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HEADER = "linear-gradient(180deg,#f0844f 0%,#dc5a2a 48%,#c9471b 52%,#d9572a 100%)";

function useToday(preview?: boolean) {
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    if (preview) return;
    const t = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(t);
  }, [preview]);
  return today;
}

function Arrow({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={dir < 0 ? "Previous month" : "Next month"}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ all: "unset", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      <svg width="6" height="8" viewBox="0 0 6 8">
        <path d={dir < 0 ? "M6 0 0 4 6 8z" : "M0 0 6 4 0 8z"} fill="#fff" />
      </svg>
    </button>
  );
}

export default function Calendar({ preview }: { preview?: boolean }) {
  const today = useToday(preview);
  const [view, setView] = useState<"day" | "month">("day");
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const shell: React.CSSProperties = {
    width: 130, height: 134, boxSizing: "border-box", overflow: "hidden",
    borderRadius: 4, border: "1px solid #9a9a9a",
    background: "linear-gradient(180deg,#ffffff 0%,#f6f6f6 70%,#e7e7e7 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,.5), inset 0 0 0 1px rgba(255,255,255,.8)",
    fontFamily: FONT, color: "#333", userSelect: "none", cursor: "default",
    display: "flex", flexDirection: "column",
  };
  const header: React.CSSProperties = {
    height: 22, flexShrink: 0, background: HEADER, color: "#fff",
    fontSize: 12, fontWeight: 600, textShadow: "0 1px 1px rgba(0,0,0,.35)",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderBottom: "1px solid #a83a14",
  };

  if (view === "day") {
    return (
      <div style={shell} onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setView("month"); }}>
        <div style={header}>{DAYS[today.getDay()]}</div>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 62, fontWeight: 300, lineHeight: 1, letterSpacing: -2, color: "#2b2b2b",
          textShadow: "0 1px 0 #fff",
        }}>
          {today.getDate()}
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "#555", paddingBottom: 9 }}>
          {MONTHS[today.getMonth()]} {today.getFullYear()}
        </div>
      </div>
    );
  }

  const first = month.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const prevDays = new Date(month.getFullYear(), month.getMonth(), 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = i - first + 1;
    if (d < 1) return { d: prevDays + d, out: true };
    if (d > days) return { d: d - days, out: true };
    return { d, out: false };
  });
  const isThisMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  return (
    <div style={shell} onClick={() => setView("day")}>
      <div style={{ ...header, justifyContent: "space-between", padding: "0 2px" }}>
        <Arrow dir={-1} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} />
        <span style={{ fontSize: 11 }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
        <Arrow dir={1} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} />
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "3px 4px 0",
        fontSize: 9, textAlign: "center", lineHeight: "14px",
      }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} style={{ color: "#888", borderBottom: "1px solid #ddd" }}>{d}</span>
        ))}
        {cells.map((c, i) => {
          const isToday = isThisMonth && !c.out && c.d === today.getDate();
          return (
            <span key={i} style={{
              color: c.out ? "#bbb" : isToday ? "#fff" : "#333",
              background: isToday ? HEADER : undefined,
              borderRadius: 2, fontWeight: isToday ? 700 : 400,
            }}>
              {c.d}
            </span>
          );
        })}
      </div>
    </div>
  );
}
