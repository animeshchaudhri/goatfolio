"use client";
import React, { useEffect, useId, useState } from "react";

// Win7 Clock gadget: silver bezel, white face, black hands, red sweep second hand.

export default function Clock({ preview }: { preview?: boolean }) {
  const id = useId().replace(/:/g, "");
  const [now, setNow] = useState(() => (preview ? new Date(2009, 9, 22, 10, 9, 36) : new Date()));

  useEffect(() => {
    if (preview) return;
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, [preview]);

  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;

  const hand = (deg: number, back: number, len: number, width: number, color: string) => (
    <line
      x1={65} y1={65 + back} x2={65} y2={65 - len}
      stroke={color} strokeWidth={width} strokeLinecap="round"
      transform={`rotate(${deg} 65 65)`}
    />
  );

  return (
    <svg width="130" height="130" viewBox="0 0 130 130" style={{ display: "block", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.55))" }}>
      <defs>
        <linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#d4d4d4" />
          <stop offset=".55" stopColor="#b5b5b5" />
          <stop offset="1" stopColor="#efefef" />
        </linearGradient>
        <radialGradient id={`${id}face`} cx=".5" cy=".42" r=".62">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".75" stopColor="#f3f3f3" />
          <stop offset="1" stopColor="#d6d6d6" />
        </radialGradient>
        <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="65" cy="65" r="61" fill={`url(#${id}rim)`} stroke="#707070" />
      <circle cx="65" cy="65" r="55" fill={`url(#${id}face)`} stroke="#9c9c9c" />
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1="65" y1={major ? 15 : 13} x2="65" y2={major ? 23 : 16}
            stroke={major ? "#262626" : "#6e6e6e"} strokeWidth={major ? 3 : 1}
            transform={`rotate(${i * 6} 65 65)`}
          />
        );
      })}
      {hand(h * 30, 7, 28, 5, "#1f1f1f")}
      {hand(m * 6, 9, 41, 3.4, "#1f1f1f")}
      {hand(s * 6, 13, 46, 1.3, "#c8171f")}
      <circle cx="65" cy="65" r="4.2" fill="#1f1f1f" />
      <circle cx="65" cy="65" r="2" fill="#c8171f" />
      <ellipse cx="65" cy="38" rx="45" ry="25" fill={`url(#${id}gloss)`} opacity=".55" />
    </svg>
  );
}
