"use client";
import React, { useEffect, useRef, useState } from "react";
import type { WindowProps } from "../Desktop/windows";
import { useDesktop } from "../Desktop/DesktopContext";
import { APPS, iconPath } from "../Desktop/apps";
import { SectionHeader } from "./Chrome";
import { CPWindow, Heading, Link, TaskPane, useNarrow, useNav, useOpen } from "./ControlPanelShell";

// Every icon this window shows (stand-ins for the Win7 artwork where not app-backed)
const ICONS = {
  window: iconPath(APPS["Personalization"]?.icon),
  sounds: iconPath(APPS["Sound Settings"]?.icon),
  screenSaver: "/icons/win7/display.svg",
};

// ─── Window color (7.css --window-background-color) ──────────────────────────
// Applied through one <style> tag so every window frame picks it up, and saved across visits.

type WindowStyle = { color: string; intensity: number; transparency: boolean };
const DEFAULT_STYLE: WindowStyle = { color: "#4580c4", intensity: 100, transparency: false };
const STYLE_KEY = "win7WindowStyle";

const GLASS_CSS = `
  .window.active:not(.glass)::before { opacity: .8; }
  .window.active:not(.glass)::after {
    content: ""; position: absolute; inset: 0; z-index: -10; border-radius: var(--window-border-radius);
    -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
  }
`;

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (rgb: number[]) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

/** Lower intensity washes the color out towards white, like Win7's slider */
const withIntensity = (hex: string, intensity: number) =>
  rgbToHex(hexToRgb(hex).map((v) => v + (255 - v) * (1 - intensity / 100) * 0.75));

function applyWindowStyle(s: WindowStyle) {
  let el = document.getElementById("win7-window-style") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "win7-window-style";
    document.head.appendChild(el);
  }
  el.textContent = `:root { --window-background-color: ${withIntensity(s.color, s.intensity)}; }` + (s.transparency ? GLASS_CSS : "");
}

function loadWindowStyle(): WindowStyle {
  try {
    return { ...DEFAULT_STYLE, ...JSON.parse(localStorage.getItem(STYLE_KEY) || "{}") };
  } catch {
    return DEFAULT_STYLE;
  }
}

// This module loads with the desktop, so the saved frame color is restored on every visit
if (typeof window !== "undefined" && localStorage.getItem(STYLE_KEY)) applyWindowStyle(loadWindowStyle());

const COLORS: { name: string; hex: string }[] = [
  { name: "Sky", hex: "#4580c4" }, { name: "Twilight", hex: "#2a4f9c" }, { name: "Sea", hex: "#2aa8b4" },
  { name: "Leaf", hex: "#3e9a2a" }, { name: "Lime", hex: "#8cc63c" }, { name: "Sun", hex: "#e6c52a" },
  { name: "Pumpkin", hex: "#e8892a" }, { name: "Ruby", hex: "#b8262a" }, { name: "Fuchsia", hex: "#d6338c" },
  { name: "Blush", hex: "#e89ac4" }, { name: "Violet", hex: "#7a4ac6" }, { name: "Lavender", hex: "#a690d6" },
  { name: "Taupe", hex: "#9a8c74" }, { name: "Chocolate", hex: "#6a3a2a" }, { name: "Slate", hex: "#5a6470" },
  { name: "Frost", hex: "#e4ecf4" },
];
const colorName = (hex: string) => COLORS.find((c) => c.hex === hex)?.name ?? "Custom";

// ─── Themes & backgrounds ─────────────────────────────────────────────────────
type Theme = { name: string; wallpaper: string; color: string };

const PICTURES = [
  { name: "Shattered", src: "/images/wallpaper2.jpg" },
  { name: "Windows", src: "/images/wallpaper.jpg" },
];

const SOLID_COLORS = [
  "#3a6ea5", "#008080", "#2b579a", "#1c3f6e", "#4e6b8b", "#5a7edc", "#94b4d4", "#6d8764",
  "#3f6e3a", "#8fbc8f", "#556b2f", "#7d6f4f", "#d2b48c", "#a0522d", "#8b4b4b", "#c05050",
  "#7a3d7a", "#c8a2c8", "#4b3d7a", "#2f4f4f", "#404040", "#808080", "#c3c3c3", "#000000",
];

const AERO_THEMES: Theme[] = [
  { name: "Windows 7", wallpaper: "/images/wallpaper.jpg", color: "#4580c4" },
  { name: "Shattered", wallpaper: "/images/wallpaper2.jpg", color: "#2a4f9c" },
];
const BASIC_THEMES: Theme[] = [
  { name: "Windows 7 Basic", wallpaper: "/images/wallpaper.jpg", color: "#6f95c2" },
  { name: "Windows Classic", wallpaper: "#3a6ea5", color: "#a6a6a6" },
  { name: "High Contrast Black", wallpaper: "#000000", color: "#5a6470" },
  { name: "High Contrast White", wallpaper: "#ffffff", color: "#e4ecf4" },
];
const DEFAULT_THEME: Theme = { name: "Animesh", wallpaper: "/images/wallpaper2.jpg", color: "#4580c4" };
const SAVED_KEY = "win7Themes";

const isImage = (w: string) => !w.startsWith("#");
const wallpaperName = (w: string) =>
  PICTURES.find((p) => p.src === w)?.name ?? (w.startsWith("#") ? "Solid color" : "Custom picture");

function Thumb({ wallpaper, color, w = 112, h = 70 }: { wallpaper: string; color?: string; w?: number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, position: "relative", flexShrink: 0,
      border: "1px solid #8d9cb0", boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      background: isImage(wallpaper) ? `center / cover no-repeat url('${wallpaper}')` : wallpaper,
    }}>
      {color && (
        <div style={{
          position: "absolute", left: 6, bottom: 6, width: 28, height: 19, borderRadius: 2,
          background: `linear-gradient(180deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.1) 45%,transparent 46%),${color}`,
          border: "1px solid rgba(0,0,0,0.55)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
        }}>
          <div style={{ position: "absolute", left: 3, right: 3, top: 5, bottom: 3, background: "#fff", opacity: 0.9 }} />
        </div>
      )}
    </div>
  );
}

function Tile({ selected, onClick, children, style }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`cp-tile${selected ? " is-selected" : ""}`}
      onClick={onClick}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: 6, ...style }}
    >
      {children}
    </div>
  );
}

function Buttons({ onSave, onCancel, saveDisabled }: { onSave: () => void; onCancel: () => void; saveDisabled?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "auto", paddingTop: 14 }}>
      <button disabled={saveDisabled} onClick={onSave}>Save changes</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function ThemesView({ style, setStyle, go }: {
  style: WindowStyle; setStyle: (s: WindowStyle) => void; go: (v: View) => void;
}) {
  const { wallpaper, setWallpaper } = useDesktop();
  const open = useOpen();
  const narrow = useNarrow();
  const [saved, setSaved] = useState<Theme[]>([]);
  const [saver, setSaver] = useState("None");

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")); } catch { /* ignore bad data */ }
    setSaver(localStorage.getItem("win7ScreenSaver") || "None");
  }, []);

  const isCurrent = (t: Theme) => t.wallpaper === wallpaper && t.color === style.color;
  const mine = [DEFAULT_THEME, ...saved];
  const all = [...mine, ...AERO_THEMES, ...BASIC_THEMES];
  const unsaved = !all.some(isCurrent);

  const apply = (t: Theme) => {
    setWallpaper(t.wallpaper);
    setStyle({ ...style, color: t.color });
  };
  const saveTheme = () => {
    const next = [...saved, { name: `My Theme ${saved.length + 1}`, wallpaper, color: style.color }];
    setSaved(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  };

  const group = (label: string, themes: Theme[]) => (
    <div key={label}>
      <SectionHeader label={`${label} (${themes.length})`} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "4px 8px 8px" }}>
        {themes.map((t) => (
          <Tile key={t.name} selected={isCurrent(t)} onClick={() => apply(t)} style={{ width: 128 }}>
            <Thumb wallpaper={t.wallpaper} color={t.color} />
            <span style={{ textAlign: "center", lineHeight: 1.25 }}>{t.name}</span>
          </Tile>
        ))}
      </div>
    </div>
  );

  const bottom: { label: string; sub: string; icon: React.ReactNode; onClick: () => void }[] = [
    { label: "Desktop Background", sub: wallpaperName(wallpaper), onClick: () => go("background"),
      icon: <Thumb wallpaper={wallpaper} w={46} h={34} /> },
    { label: "Window Color", sub: colorName(style.color), onClick: () => go("color"),
      icon: <Swatch hex={withIntensity(style.color, style.intensity)} size={36} /> },
    { label: "Sounds", sub: "Windows Default", onClick: () => open("Sound Settings"),
      icon: <img src={ICONS.sounds} width={38} height={38} alt="" /> },
    { label: "Screen Saver", sub: saver, onClick: () => open("Screen Saver Settings"),
      icon: <img src={ICONS.screenSaver} width={42} height={42} alt="" /> },
  ];

  return (
    <>
      <Heading style={{ marginBottom: 4 }}>Change the visuals and sounds on your computer</Heading>
      <div style={{ color: "#333", marginBottom: 10 }}>
        Click a theme to change the desktop background, window color, sounds, and screen saver all at once.
      </div>
      <div style={{
        flex: 1, minHeight: 150, overflowY: "auto", border: "1px solid #ccd5e0", background: "#fff",
      }}>
        {group("My Themes", unsaved ? [...mine, { name: "Unsaved Theme", wallpaper, color: style.color }] : mine)}
        {group("Aero Themes", AERO_THEMES)}
        {group("Basic and High Contrast Themes", BASIC_THEMES)}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 18, margin: "6px 2px 12px" }}>
        <Link onClick={saveTheme}>Save theme</Link>
        <Link onClick={() => open("Github")}>Get more themes online</Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 6 }}>
        {bottom.map((b) => (
          <div key={b.label} className="cp-tile" onClick={b.onClick}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 4px" }}>
            <div style={{ height: 44, display: "flex", alignItems: "center" }}>{b.icon}</div>
            <Link onClick={b.onClick}>{b.label}</Link>
            <span style={{ color: "#666", fontSize: 11 }}>{b.sub}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Swatch({ hex, size = 40 }: { hex: string; size?: number }) {
  return (
    <div style={{
      width: size, height: Math.round(size * 0.8), borderRadius: 3, flexShrink: 0,
      background: `linear-gradient(180deg,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0.15) 48%,rgba(0,0,0,0.04) 50%,rgba(255,255,255,0.2) 100%),${hex}`,
      border: "1px solid rgba(0,0,0,0.45)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55)",
    }} />
  );
}

/** Shrinks a picked file to ≤1920px JPEG so it fits in localStorage */
function readPicture(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1920 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function BackgroundView({ done }: { done: () => void }) {
  const { wallpaper, setWallpaper } = useDesktop();
  const original = useRef(wallpaper);
  const fileRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState(isImage(wallpaper) ? "pictures" : "colors");

  const cancel = () => { setWallpaper(original.current); done(); };
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setWallpaper(await readPicture(f));
    e.target.value = "";
  };

  const check = (on: boolean) => (
    <div style={{
      position: "absolute", left: 4, top: 4, width: 13, height: 13, background: "#fff",
      border: "1px solid #8f8f8f", display: on ? "flex" : "none", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.6l2.2 2.2L8 1.8" stroke="#2a4b9a" strokeWidth="1.6" fill="none" /></svg>
    </div>
  );

  return (
    <>
      <Heading style={{ marginBottom: 4 }}>Choose your desktop background</Heading>
      <div style={{ color: "#333", marginBottom: 10 }}>
        Click a picture to make it your desktop background, or select more than one picture to create a slide show.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <label htmlFor="cp-bg-loc">Picture location:</label>
        <select id="cp-bg-loc" value={location} onChange={(e) => setLocation(e.target.value)} style={{ minWidth: 210 }}>
          <option value="pictures">Windows Desktop Backgrounds</option>
          <option value="colors">Solid Colors</option>
        </select>
        <button onClick={() => fileRef.current?.click()}>Browse...</button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      <div style={{ flex: 1, minHeight: 140, overflowY: "auto", border: "1px solid #ccd5e0" }}>
        {location === "pictures" ? (
          <>
            <SectionHeader label={`Windows (${PICTURES.length})`} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "4px 8px 10px" }}>
              {PICTURES.map((p) => (
                <Tile key={p.src} selected={wallpaper === p.src} onClick={() => setWallpaper(p.src)} style={{ position: "relative" }}>
                  <Thumb wallpaper={p.src} w={134} h={84} />
                  {check(wallpaper === p.src)}
                </Tile>
              ))}
              {wallpaper.startsWith("data:") && (
                <Tile selected onClick={() => {}} style={{ position: "relative" }}>
                  <Thumb wallpaper={wallpaper} w={134} h={84} />
                  {check(true)}
                </Tile>
              )}
            </div>
          </>
        ) : (
          <>
            <SectionHeader label={`Solid Colors (${SOLID_COLORS.length})`} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "4px 8px 6px" }}>
              {SOLID_COLORS.map((c) => (
                <Tile key={c} selected={wallpaper === c} onClick={() => setWallpaper(c)} style={{ position: "relative", padding: 4 }}>
                  <div style={{ width: 64, height: 46, background: c, border: "1px solid #8d9cb0" }} />
                  {check(wallpaper === c)}
                </Tile>
              ))}
            </div>
            <div style={{ padding: "0 12px 10px" }}>
              <Link onClick={() => colorRef.current?.click()}>More...</Link>
              <input ref={colorRef} type="color" hidden
                value={wallpaper.startsWith("#") ? wallpaper : "#3a6ea5"}
                onChange={(e) => setWallpaper(e.target.value)} />
            </div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "#6d6d6d" }}>Picture position:</span>
          <select disabled value="fill" style={{ minWidth: 120 }}><option value="fill">Fill</option></select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "#6d6d6d" }}>Change picture every:</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <select disabled value="30" style={{ minWidth: 120 }}><option value="30">30 minutes</option></select>
            <input type="checkbox" id="cp-bg-shuffle" disabled />
            <label htmlFor="cp-bg-shuffle">Shuffle</label>
          </div>
        </div>
      </div>
      <Buttons onSave={done} onCancel={cancel} />
    </>
  );
}

function ColorView({ style, setStyle, done }: { style: WindowStyle; setStyle: (s: WindowStyle) => void; done: () => void }) {
  const open = useOpen();
  const original = useRef(style);
  const [mixer, setMixer] = useState(false);

  const [r, g, b] = hexToRgb(style.color).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const hue = d === 0 ? 0 : max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  const hsv = { h: Math.round((hue + 360) % 360), s: Math.round(max === 0 ? 0 : (d / max) * 100), v: Math.round(max * 100) };
  const fromHsv = (h: number, s: number, v: number) => {
    const c = (v / 100) * (s / 100), x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v / 100 - c;
    const [rr, gg, bb] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return rgbToHex([rr, gg, bb].map((t) => (t + m) * 255));
  };

  const cancel = () => { setStyle(original.current); done(); };
  const save = () => { localStorage.setItem(STYLE_KEY, JSON.stringify(style)); done(); };

  const slider = (label: string, value: number, maxV: number, on: (v: number) => void) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 92, flexShrink: 0 }}>{label}</span>
      <input type="range" min={0} max={maxV} value={value} onChange={(e) => on(Number(e.target.value))} style={{ maxWidth: 260 }} />
    </div>
  );

  return (
    <>
      <Heading>Change the color of your window borders, Start menu, and taskbar</Heading>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 520, marginBottom: 8 }}>
        {COLORS.map((c) => (
          <div key={c.name} title={c.name}
            className={`cp-tile${style.color === c.hex ? " is-selected" : ""}`}
            onClick={() => setStyle({ ...style, color: c.hex })}
            style={{ padding: 4 }}>
            <Swatch hex={c.hex} size={50} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 10 }}>Current color: {colorName(style.color)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div>
          <input type="checkbox" id="cp-transparency" checked={style.transparency}
            onChange={(e) => setStyle({ ...style, transparency: e.target.checked })} />
          <label htmlFor="cp-transparency">Enable transparency</label>
        </div>
        {slider("Color intensity:", style.intensity, 100, (v) => setStyle({ ...style, intensity: v }))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }} onClick={() => setMixer((m) => !m)}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%", border: "1px solid #8fa5c2",
            background: "linear-gradient(180deg,#fff 0%,#dfe8f3 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="8" height="8" viewBox="0 0 8 8" style={{ transform: mixer ? "rotate(180deg)" : undefined }}>
              <path d="M1 2.5l3 3 3-3" stroke="#3a5f8f" strokeWidth="1.4" fill="none" />
            </svg>
          </div>
          <span>{mixer ? "Hide color mixer" : "Show color mixer"}</span>
        </div>
        {mixer && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingLeft: 22 }}>
            {slider("Hue:", hsv.h, 359, (v) => setStyle({ ...style, color: fromHsv(v, hsv.s, hsv.v) }))}
            {slider("Saturation:", hsv.s, 100, (v) => setStyle({ ...style, color: fromHsv(hsv.h, v, hsv.v) }))}
            {slider("Brightness:", hsv.v, 100, (v) => setStyle({ ...style, color: fromHsv(hsv.h, hsv.s, v) }))}
          </div>
        )}
        <div style={{ marginTop: 4 }}>
          <Link onClick={() => open("Help and Support#personalize")}>Advanced appearance settings...</Link>
        </div>
      </div>
      <Buttons onSave={save} onCancel={cancel} />
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type View = "themes" | "background" | "color";

export default function Personalization({ app, ...props }: WindowProps) {
  const initial: View = app.url === "background" || app.url === "color" ? app.url : "themes";
  const nav = useNav<View>(initial);
  const open = useOpen();
  const [style, setStyleState] = useState<WindowStyle>(DEFAULT_STYLE);

  useEffect(() => setStyleState(loadWindowStyle()), []);

  // Theme clicks apply and save straight away; the Window Color page previews until "Save changes"
  const setStyle = (s: WindowStyle, persist = true) => {
    setStyleState(s);
    applyWindowStyle(s);
    if (persist) localStorage.setItem(STYLE_KEY, JSON.stringify(s));
  };

  const path = ["Control Panel", "Appearance and Personalization", "Personalization"];
  if (nav.cur === "background") path.push("Desktop Background");
  if (nav.cur === "color") path.push("Window Color and Appearance");

  const taskPane = nav.cur === "themes" ? (
    <TaskPane seeAlso={[
      { label: "Display", onClick: () => open("Screen Resolution") },
      { label: "Taskbar and Start Menu", onClick: () => open("Help and Support#start") },
      { label: "Ease of Access Center", onClick: () => open("Help and Support#mobile") },
    ]}>
      <Link className="cp-task" onClick={() => open("Control Panel")}>Control Panel Home</Link>
      <div style={{ height: 4 }} />
      <Link className="cp-task" onClick={() => open("Help and Support#desktop")}>Change desktop icons</Link>
      <Link className="cp-task" onClick={() => open("Devices and Printers")}>Change mouse pointers</Link>
      <Link className="cp-task" onClick={() => open("My Resume")}>Change your account picture</Link>
    </TaskPane>
  ) : undefined;

  return (
    <CPWindow
      {...props}
      title={app.title}
      icon={ICONS.window}
      path={path}
      onBack={nav.back}
      onForward={nav.fwd}
      onCrumb={(i) => (i <= 0 ? open("Control Panel") : i === 1 ? open("Control Panel#appearance") : nav.go("themes"))}
      taskPane={taskPane}
      width="800px"
      height="560px"
    >
      {nav.cur === "background" ? (
        <BackgroundView done={() => nav.go("themes")} />
      ) : nav.cur === "color" ? (
        <ColorView style={style} setStyle={(s) => setStyle(s, false)} done={() => nav.go("themes")} />
      ) : (
        <ThemesView style={style} setStyle={setStyle} go={nav.go} />
      )}
    </CPWindow>
  );
}
