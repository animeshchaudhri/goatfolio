"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import "7.css/dist/7.css";
import Alertbox from "../Alert/Alertbox";
import ShutdownVideo from "../Videoplayer/ShutdownVideo";
import StartMenu, { type PowerAction } from "./StartMenu";
import PowerScreens, { type PowerScreen } from "./PowerScreens";
import {
  FLYOUT_STYLES, VolumeFlyout, ClockFlyout, NetworkFlyout, ActionCenterFlyout, HiddenIconsFlyout, volumeIcon, MuteBadge,
} from "./TrayFlyouts";
import { iconPath, type App } from "../Desktop/apps";
import { useDesktop } from "../Desktop/DesktopContext";
import { ICONS } from "./icons";

type Tray = "hidden" | "action" | "network" | "volume" | "clock";

const STYLES = `
  .w7tb { position: relative; height: 40px; display: flex; align-items: stretch; font-family: "Segoe UI", Tahoma, sans-serif; user-select: none; -webkit-user-select: none; }
  .w7tb-orb { all: unset; position: relative; width: 54px; flex-shrink: 0; margin-right: 4px; cursor: default; }
  /* Original orb states stacked; hover fades in the rainbow glow like Win7 */
  .w7tb-orb img { position: absolute; left: -1px; top: -5px; width: 58px; height: 42px; transition: opacity 0.25s ease-out; }
  .w7tb-orb .w7tb-orb-hover, .w7tb-orb .w7tb-orb-pressed { opacity: 0; }
  .w7tb-orb:hover .w7tb-orb-hover, .w7tb-orb.is-open .w7tb-orb-hover { opacity: 1; }
  .w7tb-orb:active .w7tb-orb-pressed { opacity: 1; transition: none; }
  .w7tb-apps { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
  .w7tb-btn {
    position: relative; flex-shrink: 0; width: 58px; height: 38px; display: flex; align-items: center; justify-content: center; box-sizing: border-box;
    border: 1px solid rgba(0,0,0,0.6); border-radius: 3px; cursor: default;
    background: linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.09) 48%, rgba(255,255,255,0.02) 52%, rgba(255,255,255,0.12) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.28);
  }
  .w7tb-btn img { width: 32px; height: 32px; object-fit: contain; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.35)); pointer-events: none; }
  .w7tb-btn.is-active {
    background: linear-gradient(180deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.10) 52%, rgba(255,255,255,0.30) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.45), inset 0 -6px 10px rgba(255,255,255,0.18);
  }
  .w7tb-btn:hover {
    background:
      radial-gradient(ellipse 70% 60% at 50% 100%, rgba(130,205,255,0.75) 0%, rgba(130,205,255,0) 100%),
      linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.18) 48%, rgba(255,255,255,0.08) 52%, rgba(255,255,255,0.24) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5), 0 0 4px rgba(120,200,255,0.5);
  }
  .w7tb-btn:active { background: linear-gradient(180deg, rgba(0,0,0,0.18), rgba(110,190,255,0.35)); }
  .w7tb-tray { display: flex; align-items: stretch; flex-shrink: 0; margin-left: 4px; color: #fff; }
  .w7tb-ti { all: unset; position: relative; display: flex; align-items: center; justify-content: center; padding: 0 4px; min-width: 16px; cursor: default; }
  .w7tb-ti::before { content: ""; position: absolute; left: 1px; right: 1px; top: 4px; bottom: 4px; border-radius: 3px; border: 1px solid transparent; }
  .w7tb-ti:hover::before, .w7tb-ti.is-open::before {
    border-color: rgba(255,255,255,0.32);
    background: linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 51%, rgba(255,255,255,0.14));
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15), 0 0 0 1px rgba(0,0,0,0.25);
  }
  .w7tb-ti img { position: relative; width: 16px; height: 16px; }
  .w7tb-clock { flex-direction: column; padding: 0 7px; font-size: 12px; line-height: 16px; text-shadow: 0 0 6px rgba(0,0,0,0.9); white-space: nowrap; }
  .w7tb-clock span { position: relative; }
  .w7tb-desk {
    width: 15px; flex-shrink: 0; margin-left: 6px; border-left: 1px solid rgba(0,0,0,0.55); box-shadow: inset 1px 0 0 rgba(255,255,255,0.28);
    background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.0) 51%, rgba(255,255,255,0.1));
  }
  .w7tb-desk:hover { background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 51%, rgba(255,255,255,0.35)); }
  .w7tb-thumb {
    position: absolute; bottom: 44px; width: 200px; box-sizing: border-box; padding: 6px 8px 8px; border-radius: 6px; z-index: 4;
    background-color: rgba(26, 58, 96, 0.55);
    background-image: linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.1));
    -webkit-backdrop-filter: blur(9px) saturate(1.4); backdrop-filter: blur(9px) saturate(1.4);
    border: 1px solid rgba(0,0,0,0.75); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.32), 0 0 10px rgba(0,0,0,0.45);
    color: #fff; font-size: 12px; cursor: default;
  }
  .w7tb-thumb-close {
    all: unset; width: 16px; height: 14px; display: flex; align-items: center; justify-content: center; border-radius: 3px; flex-shrink: 0; opacity: 0;
    border: 1px solid rgba(0,0,0,0.5); border-color: rgba(0,0,0,0.5) !important;
    background: linear-gradient(180deg, #e8a493 0%, #d2553a 50%, #c33519 51%, #e09d84 100%);
  }
  .w7tb-thumb:hover .w7tb-thumb-close { opacity: 1; }
  .w7tb-thumb-close:hover { background: linear-gradient(180deg, #f6c0b0 0%, #e8684b 50%, #d8401f 51%, #f2b39d 100%); box-shadow: 0 0 6px rgba(255,120,90,0.9); }
  /* 7.css paints hover/press gradients on every button's ::before/::after; these buttons draw their own */
  .w7tb-orb::before, .w7tb-orb::after, .w7tb-ti::after, .w7tb-thumb-close::before, .w7tb-thumb-close::after { content: none !important; }
  body.w7-show-desktop .window { visibility: hidden !important; }
  body.w7-peek .window { opacity: 0.07 !important; transition: opacity 0.25s; }
  @media (max-width: 767px) {
    .w7tb-btn { width: 44px; }
    .w7tb-btn img { width: 28px; height: 28px; }
    .w7tb-clock { padding: 0 4px; font-size: 11px; }
    .w7tb-ti { padding: 0 3px; }
  }
`;

function TrayClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  return (
    <>
      <span>{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
      <span>{now.toLocaleDateString()}</span>
    </>
  );
}

function Taskbar({
  openApps,
  minimizedApps,
  closeApp,
  onTaskbarClick,
  onMinimizeApp,
}: {
  openApps: App[];
  minimizedApps: Set<string>;
  closeApp: (title: string) => void;
  onTaskbarClick: (title: string) => void;
  /** Win7 minimizes the active window when its taskbar button is clicked; without this the click just focuses */
  onMinimizeApp?: (title: string) => void;
}) {
  const { openApp } = useDesktop();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [tray, setTray] = useState<Tray | null>(null);
  const [shutdown, setShutdown] = useState(false);
  const [shutdownVideo, setShutdownVideo] = useState(false);
  const [power, setPower] = useState<PowerScreen | null>(null);
  const [preview, setPreview] = useState<{ title: string; left: number } | null>(null);
  const [desktopShown, setDesktopShown] = useState(false);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [online, setOnline] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLButtonElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const peekTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleShutdown = async () => {
    setIsStartMenuOpen(false);
    setPower(null);
    setShutdown(true);
    await new Promise((resolve) => setTimeout(resolve, 7000));
    setShutdown(false);
    setShutdownVideo(true);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    setShutdownVideo(false);
  };

  const launch = (name: string) => {
    openApp(name);
    setIsStartMenuOpen(false);
    setTray(null);
  };

  const handlePower = (action: PowerAction) => {
    setIsStartMenuOpen(false);
    if (action === "shutdown") return void handleShutdown();
    if (action === "logoff") openApps.forEach((a) => closeApp(a.title));
    setPower(action);
  };
  const endPower = useCallback(() => setPower(null), []);

  // Outside click / Esc closes the Start menu and tray flyouts
  useEffect(() => {
    if (!isStartMenuOpen && !tray) return;
    const inside = (ref: React.RefObject<HTMLElement | null>, t: EventTarget | null) => !!ref.current?.contains(t as Node);
    const onDown = (e: PointerEvent) => {
      if (isStartMenuOpen && !inside(menuRef, e.target) && !inside(orbRef, e.target)) setIsStartMenuOpen(false);
      if (tray && !inside(flyoutRef, e.target) && !inside(trayRef, e.target)) setTray(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsStartMenuOpen(false); setTray(null); }
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [isStartMenuOpen, tray]);

  // Show desktop hides every window; any window change (open, focus, close) brings them back
  useEffect(() => { document.body.classList.toggle("w7-show-desktop", desktopShown); }, [desktopShown]);
  useEffect(() => setDesktopShown(false), [openApps]);
  useEffect(() => () => document.body.classList.remove("w7-show-desktop", "w7-peek"), []);

  // Volume: persisted, applied to every <audio>/<video> on the page (including ones that start later)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("volume") ?? "null");
    if (saved) { setVolume(saved.volume); setMuted(saved.muted); }
    setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  useEffect(() => {
    localStorage.setItem("volume", JSON.stringify({ volume, muted }));
    const apply = (m: HTMLMediaElement) => { m.volume = volume / 100; m.muted = muted; };
    document.querySelectorAll<HTMLMediaElement>("audio, video").forEach(apply);
    const onPlay = (e: Event) => apply(e.target as HTMLMediaElement);
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, [volume, muted]);

  const active = desktopShown ? undefined : [...openApps].reverse().find((a) => !minimizedApps.has(a.title))?.title;

  const buttonClick = (title: string) => {
    setPreview(null);
    if (title === active && onMinimizeApp) onMinimizeApp(title);
    else onTaskbarClick(title);
  };

  const showPreview = (title: string, el: HTMLElement) => {
    clearTimeout(previewTimer.current);
    const r = el.getBoundingClientRect();
    previewTimer.current = setTimeout(() => {
      setPreview({ title, left: Math.max(4, Math.min(window.innerWidth - 204, r.left + r.width / 2 - 100)) });
    }, preview ? 0 : 450);
  };
  const hidePreview = () => {
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreview(null), 250);
  };

  const toggleTray = (t: Tray) => { setIsStartMenuOpen(false); setTray((cur) => (cur === t ? null : t)); };
  const previewApp = preview && openApps.find((a) => a.title === preview.title);

  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5000 }}>
        <style>{STYLES + FLYOUT_STYLES}</style>

        {isStartMenuOpen && (
          <div ref={menuRef} style={{ position: "absolute", left: 0, bottom: 40 }}>
            <StartMenu onLaunch={launch} onPower={handlePower} onClose={() => setIsStartMenuOpen(false)} />
          </div>
        )}

        <div ref={flyoutRef}>
          {tray === "volume" && (
            <VolumeFlyout
              volume={volume} muted={muted}
              onVolume={(v) => { setVolume(v); setMuted(false); }}
              onMute={() => setMuted((m) => !m)}
              onMixer={() => launch("Sound Settings")}
            />
          )}
          {tray === "clock" && <ClockFlyout onSettings={() => launch("Control Panel")} />}
          {tray === "network" && <NetworkFlyout online={online} onCenter={() => launch("Control Panel")} />}
          {tray === "action" && <ActionCenterFlyout onOpen={() => launch("Control Panel")} onTroubleshoot={() => launch("Help and Support")} />}
          {tray === "hidden" && (
            <HiddenIconsFlyout
              style={{ right: (trayRef.current?.offsetWidth ?? 170) - 34 }}
              items={[
                { label: "Courage", icon: ICONS.pet, onClick: () => launch("Pet") },
                { label: "Windows Live Messenger", icon: ICONS.messenger, onClick: () => launch("Chat") },
                { label: "GitHub", icon: ICONS.github, onClick: () => launch("Github") },
              ]}
              onCustomize={() => launch("Control Panel")}
            />
          )}
        </div>

        {previewApp && preview && (
          <div
            className="w7tb-thumb"
            style={{ left: preview.left }}
            onMouseEnter={() => clearTimeout(previewTimer.current)}
            onMouseLeave={hidePreview}
            onClick={() => buttonClick(previewApp.title)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
              <img src={iconPath(previewApp.icon, 16)} width={16} height={16} alt="" />
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 0 6px rgba(0,0,0,0.9)" }}>
                {previewApp.title}
              </span>
              <button
                className="w7tb-thumb-close"
                aria-label={`Close ${previewApp.title}`}
                onClick={(e) => { e.stopPropagation(); setPreview(null); closeApp(previewApp.title); }}
              >
                <svg width="8" height="7" viewBox="0 0 8 7"><path d="M1 0.5l6 6M7 0.5l-6 6" stroke="#fff" strokeWidth="1.6" /></svg>
              </button>
            </div>
            <div style={{
              height: 104, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2,
              background: "linear-gradient(180deg, #fdfdfd 0%, #e9eef4 100%)", border: "1px solid rgba(0,0,0,0.45)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.35)", opacity: minimizedApps.has(previewApp.title) ? 0.75 : 1,
            }}>
              <img src={iconPath(previewApp.icon, 48)} width={48} height={48} alt="" />
            </div>
          </div>
        )}

        <div className="w7tb h-10 w-screen bg-[var(--aero-accent)] backdrop-blur-sm bg-[url('/images/glass.png')] bg-center bg-cover bg-no-repeat bg-fixed outline outline-1 outline-[var(--aero-black)] shadow-[inset_0_1px_0_0_var(--aero-white)] [--accent:#434444] [--aero-white:#ffffff7a] [--aero-black:#000000bd] [--aero-color:rgba(116,184,252,calc(0.7*50%))] [--aero-accent:color-mix(in_srgb,#000,color-mix(in_srgb,var(--aero-color)_var(--saturation),transparent)_var(--brightness))] [--saturation:50%] [--brightness:60%] [--intensity:50%]">
          <button
            ref={orbRef}
            className={`w7tb-orb${isStartMenuOpen ? " is-open" : ""}`}
            onClick={() => { setTray(null); setIsStartMenuOpen((o) => !o); }}
            aria-label="Start"
          >
            <img src={ICONS.startOrb} alt="Start" />
            <img className="w7tb-orb-hover" src={ICONS.startOrbHover} alt="" />
            <img className="w7tb-orb-pressed" src={ICONS.startOrbPressed} alt="" />
          </button>

          <div className="w7tb-apps">
            {openApps.map((app) => (
              <div
                key={app.title}
                className={`w7tb-btn${app.title === active ? " is-active" : ""}`}
                title={preview ? undefined : app.title}
                onClick={() => buttonClick(app.title)}
                onContextMenu={(e) => { e.preventDefault(); setPreview(null); closeApp(app.title); }}
                onMouseEnter={(e) => showPreview(app.title, e.currentTarget)}
                onMouseLeave={hidePreview}
              >
                <img
                  src={iconPath(app.icon, 32)}
                  alt={app.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = ICONS.fallback; }}
                />
              </div>
            ))}
          </div>

          <div ref={trayRef} className="w7tb-tray">
            <button className={`w7tb-ti${tray === "hidden" ? " is-open" : ""}`} title="Show hidden icons" aria-label="Show hidden icons" onClick={() => toggleTray("hidden")}>
              <svg width="10" height="7" viewBox="0 0 10 7" style={{ position: "relative", filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}>
                <path d="M1 6l4-4 4 4" stroke="#fff" strokeWidth="1.6" fill="none" />
              </svg>
            </button>
            <button className={`w7tb-ti${tray === "action" ? " is-open" : ""}`} title={"Action Center\nNo current issues"} aria-label="Action Center" onClick={() => toggleTray("action")}>
              <img src={ICONS.actionCenter} alt="" />
            </button>
            <button className={`w7tb-ti${tray === "network" ? " is-open" : ""}`} title={online ? "animesh.us\nInternet access" : "Not connected"} aria-label="Network" onClick={() => toggleTray("network")}>
              <img src={ICONS.network} alt="" style={online ? undefined : { opacity: 0.55 }} />
            </button>
            <button className={`w7tb-ti${tray === "volume" ? " is-open" : ""}`} title={`Speakers: ${muted ? "Muted" : `${volume}%`}`} aria-label="Volume" onClick={() => toggleTray("volume")}>
              <span style={{ position: "relative", width: 16, height: 16 }}>
                <img src={volumeIcon(volume, muted)} alt="" />
                {muted && <MuteBadge size={9} />}
              </span>
            </button>
            <button
              className={`w7tb-ti w7tb-clock${tray === "clock" ? " is-open" : ""}`}
              aria-label="Clock"
              onClick={() => toggleTray("clock")}
            >
              <TrayClock />
            </button>
          </div>

          <div
            className="w7tb-desk"
            title="Show desktop"
            onClick={() => { document.body.classList.remove("w7-peek"); setDesktopShown((s) => !s); }}
            onMouseEnter={() => { peekTimer.current = setTimeout(() => document.body.classList.add("w7-peek"), 500); }}
            onMouseLeave={() => { clearTimeout(peekTimer.current); document.body.classList.remove("w7-peek"); }}
          />
        </div>
      </div>

      {shutdown && <div style={{ position: "fixed", inset: 0, zIndex: 20000 }}><Alertbox title="Shutting down pc ..." /></div>}
      {shutdownVideo && <div style={{ position: "fixed", inset: 0, zIndex: 20001 }}><ShutdownVideo /></div>}
      {power && <PowerScreens screen={power} onDone={endPower} onShutdown={handleShutdown} />}
    </>
  );
}

export default Taskbar;
