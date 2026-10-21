"use client";
import React, { useEffect, useRef, useState } from "react";
import { USER_NAME, USER_PICTURE } from "./StartMenu";
import { ICONS } from "./icons";

export type PowerScreen = "lock" | "switch" | "logoff" | "sleep" | "restart";

type Phase =
  | { kind: "busy"; text: string }
  | { kind: "tiles" }
  | { kind: "locked" }
  | { kind: "black" };

const FIRST_PHASE: Record<PowerScreen, Phase> = {
  lock: { kind: "locked" },
  switch: { kind: "tiles" },
  logoff: { kind: "busy", text: "Logging off..." },
  restart: { kind: "busy", text: "Logging off..." },
  sleep: { kind: "black" },
};

const STYLES = `
  .w7ps {
    position: fixed; inset: 0; z-index: 20000; display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-family: "Segoe UI", Tahoma, sans-serif; color: #fff; user-select: none; -webkit-user-select: none; overflow: hidden;
    background: #0b3e7d url("${ICONS.logonBackground}") center / cover no-repeat;
  }
  .w7ps-text { text-shadow: 0 1px 7px rgba(0,0,0,0.55); }
  .w7ps-tile {
    width: 126px; height: 126px; box-sizing: border-box; padding: 10px; border-radius: 9px;
    background: linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.20) 48%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.32) 100%);
    border: 1px solid rgba(0,0,0,0.45);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.38);
  }
  .w7ps-tile.is-button { cursor: pointer; }
  .w7ps-tile.is-button:hover { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.75), 0 0 16px rgba(150,215,255,0.95); }
  .w7ps-tile > div { width: 100%; height: 100%; background: #fff; border: 1px solid rgba(0,0,0,0.35); border-radius: 3px; overflow: hidden; }
  .w7ps-tile img { width: 100%; height: 100%; object-fit: contain; }
  .w7ps-pass { display: flex; align-items: center; gap: 6px; margin-top: 14px; }
  .w7ps-pass input {
    width: 225px; height: 25px; box-sizing: border-box; padding: 0 7px; font: 12px "Segoe UI", Tahoma, sans-serif; color: #000;
    background: #fff; border: 1px solid #1d4f88; border-radius: 3px; outline: none;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.35);
  }
  .w7ps-pass input::placeholder { color: #8a8a8a; font-style: italic; }
  .w7ps-go {
    all: unset; width: 27px; height: 27px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: radial-gradient(circle at 50% 30%, #9fd8ff 0%, #3f9ae6 45%, #1460b4 100%);
    border: 1px solid #0b3f7a; border-color: #0b3f7a !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 0 4px rgba(0,0,0,0.4);
  }
  .w7ps-go:hover { background: radial-gradient(circle at 50% 30%, #c4e8ff 0%, #5db0f2 45%, #1a6fc6 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 0 9px rgba(150,215,255,0.95); }
  /* Original logon power button: normal / hover / pressed frames */
  .w7ps-power {
    all: unset; position: absolute; right: 24px; bottom: 22px; width: 22px; height: 22px; cursor: pointer;
    background: url("${ICONS.logonPower}") center / 22px 22px no-repeat;
  }
  .w7ps-power:hover { background-image: url("${ICONS.logonPowerHover}"); }
  .w7ps-power:active { background-image: url("${ICONS.logonPowerPressed}"); }
  .w7ps-go::before, .w7ps-go::after, .w7ps-power::before, .w7ps-power::after { content: none !important; }
  .w7ps-brand { position: absolute; bottom: 28px; left: 0; right: 0; display: flex; justify-content: center; align-items: baseline; gap: 6px; opacity: 0.92; }
`;

function Tile({ onClick }: { onClick?: () => void }) {
  return (
    <div className={`w7ps-tile${onClick ? " is-button" : ""}`} onClick={onClick}>
      <div><img src={USER_PICTURE} alt={USER_NAME} /></div>
    </div>
  );
}

function Busy({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span className="loader animate" aria-hidden style={{ transform: "scale(1.5)" }} />
      <span className="w7ps-text" style={{ fontSize: 30, fontWeight: 300 }}>{text}</span>
    </div>
  );
}

export default function PowerScreens({ screen, onDone, onShutdown }: {
  screen: PowerScreen;
  /** Back to the desktop */
  onDone: () => void;
  onShutdown: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(FIRST_PHASE[screen]);
  const passRef = useRef<HTMLInputElement>(null);

  const signIn = () => setPhase({ kind: "busy", text: "Welcome" });

  // Timed transitions between busy screens
  useEffect(() => {
    if (phase.kind !== "busy") return;
    const next: Record<string, () => void> = {
      "Logging off...": () => (screen === "restart" ? setPhase({ kind: "busy", text: "Restarting..." }) : setPhase({ kind: "tiles" })),
      "Restarting...": () => window.location.reload(),
      Welcome: onDone,
    };
    const t = setTimeout(next[phase.text], phase.text === "Restarting..." ? 2200 : 1400);
    return () => clearTimeout(t);
  }, [phase, screen, onDone]);

  // Keyboard: Enter signs in; any key wakes from sleep
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase.kind === "black") onDone();
      else if (e.key === "Enter" && (phase.kind === "locked" || phase.kind === "tiles")) signIn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onDone]);

  useEffect(() => {
    if (phase.kind === "locked" && window.matchMedia("(pointer: fine)").matches) passRef.current?.focus();
  }, [phase]);

  if (phase.kind === "black") {
    return (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 20000, background: "#000", cursor: "none" }}
        onPointerDown={onDone}
      />
    );
  }

  return (
    <div className="w7ps" onContextMenu={(e) => e.preventDefault()}>
      <style>{STYLES}</style>

      {phase.kind === "busy" && <Busy text={phase.text} />}

      {phase.kind === "tiles" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tile onClick={signIn} />
          <div className="w7ps-text" style={{ fontSize: 22, fontWeight: 300, marginTop: 12 }}>{USER_NAME}</div>
        </div>
      )}

      {phase.kind === "locked" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Tile onClick={signIn} />
          <div className="w7ps-text" style={{ fontSize: 22, fontWeight: 300, marginTop: 12 }}>{USER_NAME}</div>
          <div className="w7ps-text" style={{ fontSize: 14, marginTop: 2 }}>Locked</div>
          <form className="w7ps-pass" onSubmit={(e) => { e.preventDefault(); signIn(); }}>
            <input ref={passRef} type="password" placeholder="Password" aria-label="Password" />
            <button className="w7ps-go" type="submit" aria-label="Unlock">
              <svg width="13" height="11" viewBox="0 0 13 11"><path d="M1 5.5h9M6.5 1.5l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </div>
      )}

      {(phase.kind === "tiles" || phase.kind === "locked") && (
        <>
          <div className="w7ps-brand w7ps-text">
            <span style={{ fontSize: 26, fontWeight: 300 }}>Windows</span>
            <span style={{ fontSize: 34, fontWeight: 400 }}>7</span>
            <span style={{ fontSize: 17, fontWeight: 300 }}>Ultimate</span>
          </div>
          <button className="w7ps-power" aria-label="Shut down" onClick={onShutdown} />
        </>
      )}
    </div>
  );
}
