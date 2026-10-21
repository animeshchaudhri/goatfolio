"use client";
import React, { useEffect, useState } from "react";
import { useDesktop } from "../Desktop/DesktopContext";
import { ICONS } from "../DesktopIcons/icons";

// Win7 Slide Show gadget: cross-fading photos; hover shows Previous / Pause / Next / View.

const PHOTOS = ["/images/wallpaper2.jpg", "/images/wallpaper.jpg"];
const INTERVAL = 8000;

function Btn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        all: "unset",
        width: 22, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 3, cursor: "pointer",
        background: h ? "linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,.12))" : "transparent",
        boxShadow: h ? "inset 0 0 0 1px rgba(255,255,255,.45)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export default function SlideShow({ preview }: { preview?: boolean }) {
  const { openApp } = useDesktop();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [controls, setControls] = useState(false);

  useEffect(() => {
    if (preview || !playing) return;
    const t = setInterval(() => setI((n) => (n + 1) % PHOTOS.length), INTERVAL);
    return () => clearInterval(t);
  }, [preview, playing]);

  const go = (d: number) => setI((n) => (n + d + PHOTOS.length) % PHOTOS.length);

  return (
    <div
      onMouseEnter={() => setControls(true)}
      onMouseLeave={() => setControls(false)}
      onClick={() => setControls((c) => !c)}
      style={{
        width: 130, height: 98, position: "relative", overflow: "hidden", boxSizing: "border-box",
        background: "#000", border: "1px solid #111", borderRadius: 2,
        boxShadow: "0 2px 5px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.12)",
      }}
    >
      {PHOTOS.map((src, n) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          style={{
            position: "absolute", inset: 3, width: "calc(100% - 6px)", height: "calc(100% - 6px)",
            objectFit: "cover", opacity: n === i ? 1 : 0, transition: "opacity 1s ease",
            pointerEvents: "none",
          }}
        />
      ))}
      {!preview && (
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
          background: "linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,.75))",
          opacity: controls ? 1 : 0, transition: "opacity .2s",
          pointerEvents: controls ? "auto" : "none",
        }}>
          <Btn label="Previous" onClick={() => go(-1)}>
            <svg width="10" height="8" viewBox="0 0 10 8"><path d="M5 0 0 4 5 8zM10 0 5 4 10 8z" fill="#fff" /></svg>
          </Btn>
          <Btn label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
            {playing
              ? <svg width="8" height="9" viewBox="0 0 8 9"><path d="M0 0h3v9H0zM5 0h3v9H5z" fill="#fff" /></svg>
              : <svg width="8" height="9" viewBox="0 0 8 9"><path d="M0 0 8 4.5 0 9z" fill="#fff" /></svg>}
          </Btn>
          <Btn label="Next" onClick={() => go(1)}>
            <svg width="10" height="8" viewBox="0 0 10 8"><path d="M0 0 5 4 0 8zM5 0 10 4 5 8z" fill="#fff" /></svg>
          </Btn>
          <Btn
            label="View"
            onClick={() => openApp({ title: "Windows Photo Viewer", url: PHOTOS[i], type: "browser", icon: ICONS.photoViewer })}
          >
            <svg width="11" height="11" viewBox="0 0 11 11">
              <circle cx="4.5" cy="4.5" r="3.3" fill="none" stroke="#fff" strokeWidth="1.4" />
              <path d="M7 7l3.2 3.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Btn>
        </div>
      )}
    </div>
  );
}
