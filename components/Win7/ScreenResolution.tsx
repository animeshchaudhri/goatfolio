"use client";
import React, { useEffect, useRef, useState } from "react";
import type { WindowProps } from "../Desktop/windows";
import { APPS, iconPath } from "../Desktop/apps";
import { FONT } from "./Chrome";
import { CPWindow, Heading, Link, Overlay, useNarrow, useOpen } from "./ControlPanelShell";

// Screen Resolution page. Resolutions come from the real screen; applying shows Win7's 15 second
// "keep these settings?" countdown (the browser can't actually change the mode).

const ICONS = {
  window: iconPath(APPS["Screen Resolution"]?.icon),
  info: "/icons/win7/help.svg",
};

type Res = { w: number; h: number };
const COMMON: Res[] = [
  { w: 2560, h: 1600 }, { w: 2560, h: 1440 }, { w: 1920, h: 1200 }, { w: 1920, h: 1080 }, { w: 1680, h: 1050 },
  { w: 1600, h: 900 }, { w: 1440, h: 900 }, { w: 1366, h: 768 }, { w: 1280, h: 1024 }, { w: 1280, h: 800 },
  { w: 1280, h: 720 }, { w: 1024, h: 768 }, { w: 800, h: 600 },
];
const ORIENTATIONS = ["Landscape", "Portrait", "Landscape (flipped)", "Portrait (flipped)"];
const label = (r: Res) => `${r.w} × ${r.h}`;

function Monitor() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: 118, height: 82, padding: 3, borderRadius: 3,
        background: "linear-gradient(180deg,#4f545b 0%,#26292d 100%)",
        boxShadow: "0 0 0 3px #9fcaf2, 0 0 0 4px #5b9bd8",
      }}>
        <div style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(160deg,#8fd0ff 0%,#2f86de 45%,#1757b0 100%)",
          fontFamily: FONT, fontSize: 46, fontWeight: 700, color: "#fff",
          textShadow: "0 0 2px #0a2c66, 0 1px 3px rgba(0,0,0,0.6)",
        }}>1</div>
      </div>
      <div style={{ width: 26, height: 9, background: "linear-gradient(180deg,#8a9099,#555b63)", marginTop: 4 }} />
      <div style={{ width: 54, height: 4, borderRadius: 2, background: "#4a4f57" }} />
    </div>
  );
}

/** Win7's resolution combobox: drops down a High…Low slider instead of a list */
function ResolutionPicker({ options, value, onChange }: { options: Res[]; value: number; onChange: (i: number) => void }) {
  const [open, setOpen] = useState<null | "down" | "up">(null);
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ROW = 17;
  const max = options.length - 1;
  const trackH = max * ROW;

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("touchstart", away); };
  }, [open]);

  const toggle = () => {
    if (open) return setOpen(null);
    // open upwards when the page below the box is too short for the slider
    const box = ref.current!.getBoundingClientRect();
    const page = ref.current!.closest(".cp-main")?.getBoundingClientRect();
    setOpen(page && page.bottom - box.bottom < trackH + 60 && box.top - page.top > page.bottom - box.bottom ? "up" : "down");
  };

  const fromPointer = (clientY: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    onChange(Math.max(0, Math.min(max, Math.round((clientY - r.top) / ROW))));
  };

  return (
    <div ref={ref} style={{ position: "relative", width: 250, maxWidth: "100%" }}>
      <select
        value={value}
        onMouseDown={(e) => { e.preventDefault(); toggle(); }}
        onTouchStart={(e) => { e.preventDefault(); toggle(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.max(0, Math.min(max, value + (e.key === "ArrowDown" ? 1 : -1)))); }
        }}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      >
        {options.map((r, i) => <option key={label(r)} value={i}>{label(r)}{i === 0 ? " (recommended)" : ""}</option>)}
      </select>
      {open && (
        <div style={{
          position: "absolute", left: 0, width: "100%", zIndex: 20, display: "flex", gap: 6,
          ...(open === "down" ? { top: 23 } : { bottom: 23 }),
          padding: "6px 10px 6px 8px", background: "#fff", border: "1px solid #646464",
          boxShadow: "2px 2px 4px rgba(0,0,0,0.3)", fontFamily: FONT, fontSize: 12,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30, flexShrink: 0 }}>
            <span style={{ height: 16 }}>High</span>
            <div
              ref={trackRef}
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e.clientY); }}
              onPointerMove={(e) => e.buttons && fromPointer(e.clientY)}
              style={{ position: "relative", width: 24, height: trackH, margin: "8px 0", cursor: "default", touchAction: "none" }}
            >
              {/* track */}
              <div style={{
                position: "absolute", left: 10, top: 0, bottom: 0, width: 4,
                background: "#e7eaea", boxShadow: "inset 1px 1px 1px #999, inset -1px -1px #fff",
              }} />
              {options.map((_, i) => (
                <div key={i} style={{ position: "absolute", left: 18, top: i * ROW, width: 5, height: 1, background: "#8c8c8c" }} />
              ))}
              {/* thumb */}
              <div style={{
                position: "absolute", left: 3, top: value * ROW - 5, width: 18, height: 10, borderRadius: 2,
                background: "linear-gradient(180deg,#f2f2f2 0%,#ebebeb 45%,#dddddd 50%,#cfcfcf 100%)",
                border: "1px solid #707070", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.8)",
              }} />
            </div>
            <span style={{ height: 16 }}>Low</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", paddingTop: 16, minWidth: 0 }}>
            {options.map((r, i) => (
              <div key={label(r)} onClick={() => { onChange(i); setOpen(null); }} style={{
                height: ROW, lineHeight: `${ROW}px`, marginTop: i === 0 ? 0 : 0, padding: "0 4px", cursor: "default",
                whiteSpace: "nowrap", transform: "translateY(-0.5px)",
                background: i === value ? "#3399ff" : "transparent", color: i === value ? "#fff" : "#1a1a1a",
                fontWeight: i === 0 ? 600 : 400,
              }}>
                {label(r)}{i === 0 ? " (recommended)" : ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KeepDialog({ onKeep, onRevert }: { onKeep: () => void; onRevert: () => void }) {
  const [left, setLeft] = useState(15);
  useEffect(() => {
    if (left <= 0) { onRevert(); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onRevert]);

  return (
    <Overlay>
      <div style={{ position: "fixed", inset: 0, zIndex: 20000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="window active" style={{ width: 360 }}>
          <div className="title-bar">
            <div className="title-bar-text">Display Settings</div>
            <div className="title-bar-controls"><button aria-label="Close" onClick={onRevert} /></div>
          </div>
          <div className="window-body has-space" style={{ fontFamily: FONT, fontSize: 12 }}>
            <p style={{ margin: "4px 0 10px", fontSize: 15, color: "#1E3287" }}>Do you want to keep these display settings?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={onKeep}>Keep changes</button>
              <button onClick={onRevert}>Revert</button>
            </div>
            <p style={{ margin: "12px 0 0", color: "#333" }}>Reverting to previous display settings in {left} seconds.</p>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

export default function ScreenResolution({ app, ...props }: WindowProps) {
  const open = useOpen();
  const [options, setOptions] = useState<Res[]>([{ w: 1920, h: 1080 }]);
  const [applied, setApplied] = useState({ res: 0, orient: 0 });
  const [pending, setPending] = useState({ res: 0, orient: 0 });
  const [confirm, setConfirm] = useState<null | "apply" | "ok">(null);
  const [identify, setIdentify] = useState(false);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const native = { w: Math.round(screen.width * dpr), h: Math.round(screen.height * dpr) };
    const smaller = COMMON.filter((r) => r.w <= native.w && r.h <= native.h && label(r) !== label(native));
    setOptions([native, ...smaller]);
  }, []);

  useEffect(() => {
    if (!identify) return;
    const t = setTimeout(() => setIdentify(false), 3000);
    return () => clearTimeout(t);
  }, [identify]);

  const dirty = pending.res !== applied.res || pending.orient !== applied.orient;
  const apply = (then: "apply" | "ok") => (dirty ? setConfirm(then) : then === "ok" && props.onClose());

  return (
    <CPWindow
      {...props}
      title={app.title}
      icon={ICONS.window}
      path={["Control Panel", "Appearance and Personalization", "Display", "Screen Resolution"]}
      onCrumb={(i) => (i <= 0 ? open("Control Panel") : i === 1 ? open("Control Panel#appearance") : undefined)}
      width="660px"
      height="520px"
    >
      <Body
        options={options} pending={pending} setPending={setPending} detected={detected}
        onDetect={() => setDetected(true)} onIdentify={() => setIdentify(true)}
        onOk={() => apply("ok")} onCancel={props.onClose} onApply={() => apply("apply")} dirty={dirty}
        openHelp={() => open("Help and Support#display")} openAdvanced={() => open("Devices and Printers")}
      />
      {identify && (
        <Overlay>
          <div style={{
            position: "fixed", left: 40, top: 30, zIndex: 20000, pointerEvents: "none",
            fontFamily: FONT, fontSize: 180, fontWeight: 700, lineHeight: 1, color: "#fff",
            WebkitTextStroke: "4px #111", textShadow: "4px 4px 8px rgba(0,0,0,0.5)",
          }}>1</div>
        </Overlay>
      )}
      {confirm && (
        <KeepDialog
          onKeep={() => { setApplied(pending); const then = confirm; setConfirm(null); if (then === "ok") props.onClose(); }}
          onRevert={() => { setPending(applied); setConfirm(null); }}
        />
      )}
    </CPWindow>
  );
}

function Body({ options, pending, setPending, detected, onDetect, onIdentify, onOk, onCancel, onApply, dirty, openHelp, openAdvanced }: {
  options: Res[]; pending: { res: number; orient: number }; setPending: (p: { res: number; orient: number }) => void;
  detected: boolean; onDetect: () => void; onIdentify: () => void;
  onOk: () => void; onCancel: () => void; onApply: () => void; dirty: boolean;
  openHelp: () => void; openAdvanced: () => void;
}) {
  const narrow = useNarrow();
  const row = (name: string, control: React.ReactNode, extra?: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: narrow ? "flex-start" : "center", flexDirection: narrow ? "column" : "row", gap: narrow ? 3 : 10 }}>
      <span style={{ width: narrow ? undefined : 76, flexShrink: 0 }}>{name}</span>
      {control}
      {extra && <div style={{ marginLeft: narrow ? 0 : "auto" }}>{extra}</div>}
    </div>
  );

  return (
    <>
      <Heading>Change the appearance of your display</Heading>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16 }}>
        <div style={{
          flex: 1, height: 150, position: "relative", border: "1px solid #d5dbe3",
          display: "flex", alignItems: "center", justifyContent: "center", background: "#fff",
        }}>
          <Monitor />
          {detected && (
            <div style={{ position: "absolute", left: 10, bottom: 8, display: "flex", alignItems: "center", gap: 5, color: "#333" }}>
              <img src={ICONS.info} width={16} height={16} alt="" />
              Another display not detected
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={onDetect}>Detect</button>
          <button onClick={onIdentify}>Identify</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, maxWidth: 560 }}>
        {row("Display:", (
          <select style={{ width: 250, maxWidth: "100%" }} defaultValue="1">
            <option value="1">1. Generic PnP Monitor</option>
          </select>
        ))}
        {row("Resolution:", <ResolutionPicker options={options} value={pending.res} onChange={(res) => setPending({ ...pending, res })} />)}
        {row("Orientation:", (
          <select style={{ width: 250, maxWidth: "100%" }} value={pending.orient}
            onChange={(e) => setPending({ ...pending, orient: Number(e.target.value) })}>
            {ORIENTATIONS.map((o, i) => <option key={o} value={i}>{o}</option>)}
          </select>
        ), <Link onClick={openAdvanced}>Advanced settings</Link>)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 20 }}>
        <Link onClick={openHelp}>Make text and other items larger or smaller</Link>
        <Link onClick={openHelp}>What display settings should I choose?</Link>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "auto", paddingTop: 16 }}>
        <button onClick={onOk}>OK</button>
        <button onClick={onCancel}>Cancel</button>
        <button onClick={onApply} disabled={!dirty}>Apply</button>
      </div>
    </>
  );
}
