"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { programs } from "../Icons";
import { APPS, ACTIONS, iconPath } from "../Desktop/apps";
import { ICONS } from "./icons";

export type PowerAction = "shutdown" | "switch" | "logoff" | "lock" | "restart" | "sleep";

export const USER_NAME = "Animesh";
export const USER_PICTURE = ICONS.userPicture;

// ACTIONS have no APPS entry, so they need their own icons
const ACTION_ICONS: Record<string, string> = { Github: ICONS.github, LinkedIn: ICONS.linkedin, Pet: ICONS.pet, Courage: ICONS.pet };
export const iconFor = (name: string, size = 32) => iconPath(APPS[name]?.icon ?? ACTION_ICONS[name], size);

// ─── All Programs tree ────────────────────────────────────────────────────────
type Entry = { name: string; label?: string } | { folder: string; children: Entry[] };

const ALL_PROGRAMS: Entry[] = [
  { name: "Default Programs" },
  { name: "Gadgets", label: "Desktop Gadget Gallery" },
  { name: "Github", label: "GitHub" },
  { name: "Internet Explorer" },
  { name: "LinkedIn" },
  { name: "My Blog" },
  { name: "My Projects" },
  { name: "My Resume" },
  { name: "Twitter" },
  { folder: "Accessories", children: [
    { name: "Getting started", label: "Getting Started" },
    { name: "Notepad" },
    { name: "Remote Desktop Connection" },
    { name: "Computer", label: "Windows Explorer" },
    { folder: "System Tools", children: [
      { name: "Control Panel" },
      { name: "Screen Resolution" },
      { name: "Sound Settings", label: "Sound" },
    ] },
  ] },
  { folder: "Games", children: [
    { name: "Doom" },
    { name: "Games", label: "Games Explorer" },
    { name: "Horror" },
  ] },
  { folder: "Maintenance", children: [
    { name: "Devices and Printers" },
    { name: "Help and Support", label: "Windows Help and Support" },
  ] },
  { folder: "Startup", children: [{ name: "Pet", label: "Courage" }] },
  { folder: "Windows Live", children: [{ name: "Chat", label: "Windows Live Messenger" }] },
];

// ─── Search index ─────────────────────────────────────────────────────────────
type SearchItem = { name: string; label: string; group: "Programs" | "Control Panel" | "Files" };

const CONTROL_PANEL_TYPES = new Set(["controlPanel", "personalization", "screenResolution", "sound", "devicesPrinters", "defaultPrograms"]);
const FILE_TYPES = new Set(["library", "recycleBin", "fileBrowser"]);
const FILE_NAMES = new Set(["My Resume", "My Blog"]);
const GROUP_ORDER: SearchItem["group"][] = ["Programs", "Control Panel", "Files"];

function buildIndex(): SearchItem[] {
  const labels = new Map<string, string>();
  const walk = (entries: Entry[]) => entries.forEach((e) => {
    if ("folder" in e) walk(e.children);
    else if (!labels.has(e.name)) labels.set(e.name, e.label ?? e.name);
  });
  programs.forEach((p) => labels.set(p.name, p.label ?? p.name));
  walk(ALL_PROGRAMS);
  [...Object.keys(APPS), ...Object.keys(ACTIONS)].forEach((n) => { if (!labels.has(n)) labels.set(n, n); });

  return [...labels].map(([name, label]) => {
    const type = APPS[name]?.type ?? "";
    const group: SearchItem["group"] = CONTROL_PANEL_TYPES.has(type) ? "Control Panel"
      : FILE_TYPES.has(type) || FILE_NAMES.has(name) ? "Files" : "Programs";
    return { name, label, group };
  }).sort((a, b) => a.label.localeCompare(b.label));
}

// Win7 matches each typed word against the start of a word in the name
function matches(item: SearchItem, query: string) {
  const words = `${item.label} ${item.name} ${APPS[item.name]?.title ?? ""}`.toLowerCase().split(/[^a-z0-9]+/);
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((q) => words.some((w) => w.startsWith(q)));
}

// ─── Right column ─────────────────────────────────────────────────────────────
// null = separator; USER_NAME opens the resume (the "user folder" of this machine)
const PLACES: (string | null)[] = [
  USER_NAME, "Documents", "Pictures", "Music", null,
  "Games", "Computer", null,
  "Control Panel", "Devices and Printers", "Default Programs", "Help and Support",
];

const POWER_ITEMS: (PowerAction | null)[] = ["switch", "logoff", "lock", null, "restart", "sleep"];
const POWER_LABELS: Record<PowerAction, string> = {
  shutdown: "Shut down", switch: "Switch user", logoff: "Log off", lock: "Lock", restart: "Restart", sleep: "Sleep",
};

const STYLES = `
  .w7sm { position: relative; font-family: "Segoe UI", Tahoma, sans-serif; font-size: 12px; user-select: none; -webkit-user-select: none; }
  .w7sm-glass {
    position: absolute; inset: 0; border-radius: 6px 6px 0 0;
    background-color: rgba(26, 58, 96, 0.58);
    background-image: linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 28%, rgba(0,0,0,0.10) 100%), url('/images/glass.png');
    background-size: 100% 100%, cover;
    -webkit-backdrop-filter: blur(9px) saturate(1.4); backdrop-filter: blur(9px) saturate(1.4);
    border: 1px solid rgba(0,0,0,0.78);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.34), 0 0 9px rgba(0,0,0,0.5);
  }
  .w7sm-left {
    position: absolute; left: 7px; top: 7px; bottom: 43px; width: calc(100% - 152px);
    background: #fff; border: 1px solid rgba(0,0,0,0.55); border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.38);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .w7sm-list { flex: 1; min-height: 0; overflow-y: auto; padding: 3px 0; }
  .w7sm-item {
    display: flex; align-items: center; gap: 9px; margin: 0 3px; padding: 0 6px;
    border: 1px solid transparent; border-radius: 3px; color: #1e1e1e; cursor: default; white-space: nowrap;
  }
  .w7sm-item.is-big { height: 38px; }
  .w7sm-item.is-small { height: 22px; gap: 6px; }
  .w7sm-item > span { overflow: hidden; text-overflow: ellipsis; }
  .w7sm-item:hover, .w7sm-item.is-selected {
    background: linear-gradient(180deg, #f3f8fd 0%, #dceafb 100%);
    border-color: #7da2ce; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8);
  }
  .w7sm-sep { height: 1px; margin: 4px 10px; background: linear-gradient(90deg, rgba(213,223,233,0), #d5dfe9 15%, #d5dfe9 85%, rgba(213,223,233,0)); }
  .w7sm-all { flex-shrink: 0; padding-bottom: 4px; }
  .w7sm-all .w7sm-item { height: 26px; gap: 8px; padding-left: 10px; }
  .w7sm-tri { width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; }
  .w7sm-tri.is-right { border-left: 5px solid #1e1e1e; }
  .w7sm-tri.is-left { border-right: 5px solid #1e1e1e; }
  .w7sm-group { display: flex; align-items: center; gap: 6px; padding: 7px 9px 3px; color: #1e395b; white-space: nowrap; }
  .w7sm-group::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; }
  .w7sm-empty { padding: 10px 12px; color: #6d6d6d; }
  .w7sm-search {
    position: absolute; left: 9px; bottom: 9px; height: 24px; width: calc(100% - 156px);
    background: #fff; border: 1px solid rgba(0,0,0,0.62); border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.28), inset 0 1px 2px rgba(0,0,0,0.12);
    display: flex; align-items: center; padding: 0 3px 0 6px; box-sizing: border-box;
  }
  .w7sm-search input { all: unset; flex: 1; min-width: 0; font-family: inherit; font-size: 12px; color: #000; cursor: text; }
  .w7sm-search input::placeholder { color: #6d6d6d; font-style: italic; }
  .w7sm-search button { all: unset; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 2px; }
  .w7sm-search button.is-clear:hover { background: #e8f1fb; box-shadow: inset 0 0 0 1px #8fb5e0; }
  .w7sm-right { position: absolute; top: 58px; right: 7px; width: 133px; display: flex; flex-direction: column; }
  .w7sm-place {
    display: flex; align-items: center; height: 29px; padding: 0 9px;
    border: 1px solid transparent; border-radius: 3px; color: #fff; cursor: default; white-space: nowrap;
    text-shadow: 0 0 7px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.8);
  }
  .w7sm-place:hover, .w7sm-place:active {
    background: linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.13) 48%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.17) 100%);
    border-color: rgba(0,0,0,0.6); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.42), 0 0 5px rgba(130,200,255,0.35);
  }
  .w7sm-place-sep { height: 1px; margin: 4px 6px; background: linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0)); box-shadow: 0 1px 0 rgba(255,255,255,0.18); }
  /* Original Win7 user tile frame (65x66) drawn over a 48px picture whose edges it covers */
  .w7sm-pic { position: absolute; top: -15px; right: 39px; width: 65px; height: 66px; }
  .w7sm-pic > div { position: absolute; left: 5px; top: 5px; width: 48px; height: 48px; background: #fff; overflow: hidden; }
  .w7sm-pic > div img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity 0.18s ease-out; }
  .w7sm-pic-frame { position: absolute; left: 0; top: 0; width: 65px; height: 66px; pointer-events: none; }
  .w7sm-power { position: absolute; right: 7px; bottom: 9px; display: flex; height: 24px; }
  .w7sm-pbtn {
    all: unset; display: flex; align-items: center; justify-content: center; box-sizing: border-box; height: 24px; color: #fff; cursor: default;
    text-shadow: 0 0 4px rgba(0,0,0,0.9); border: 1px solid rgba(0,0,0,0.72); border-color: rgba(0,0,0,0.72) !important;
    background: linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.17) 48%, rgba(0,0,0,0.14) 50%, rgba(255,255,255,0.13) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.38);
  }
  .w7sm-pbtn:hover, .w7sm-pbtn.is-open {
    background: linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(205,232,255,0.32) 48%, rgba(30,110,200,0.34) 50%, rgba(110,195,255,0.5) 100%);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55), 0 0 7px rgba(140,210,255,0.75);
  }
  .w7sm-pbtn:active { background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(40,120,200,0.45)); }
  .w7sm button::before, .w7sm button::after { content: none !important; }
  .w7-menu {
    position: absolute; z-index: 2; min-width: 120px; padding: 2px; background: #f0f0f0; border: 1px solid #979797;
    box-shadow: 3px 3px 3px -1px rgba(0,0,0,0.38); font-size: 12px; color: #000;
  }
  .w7-menu::before { content: ""; position: absolute; top: 2px; bottom: 2px; left: 27px; width: 1px; background: #e2e3e3; box-shadow: 1px 0 0 #fff; }
  .w7-menu-item { position: relative; height: 22px; display: flex; align-items: center; padding: 0 22px 0 33px; border: 1px solid transparent; border-radius: 3px; cursor: default; white-space: nowrap; }
  .w7-menu-item:hover { background: linear-gradient(180deg, #f2f8fe 0%, #dcebfc 100%); border-color: #a8caf0; }
  .w7-menu-sep { height: 0; margin: 3px 1px 3px 29px; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #fff; }
`;

function AllProgramsTree({ entries, depth, open, toggle, onLaunch }: {
  entries: Entry[]; depth: number; open: Set<string>; toggle: (path: string) => void; onLaunch: (name: string) => void;
}) {
  return (
    <>
      {entries.map((e) => "folder" in e ? (
        <React.Fragment key={e.folder}>
          <div className="w7sm-item is-small" style={{ paddingLeft: 6 + depth * 16 }} onClick={() => toggle(`${depth}/${e.folder}`)}>
            <img src={iconPath(open.has(`${depth}/${e.folder}`) ? ICONS.folderOpen : ICONS.folder, 16)} width={16} height={16} alt="" />
            <span>{e.folder}</span>
          </div>
          {open.has(`${depth}/${e.folder}`) && (
            <AllProgramsTree entries={e.children} depth={depth + 1} open={open} toggle={toggle} onLaunch={onLaunch} />
          )}
        </React.Fragment>
      ) : (
        <div key={e.name + (e.label ?? "")} className="w7sm-item is-small" style={{ paddingLeft: 6 + depth * 16 }} onClick={() => onLaunch(e.name)}>
          <img src={iconFor(e.name, 16)} width={16} height={16} alt="" />
          <span>{e.label ?? e.name}</span>
        </div>
      ))}
    </>
  );
}

// ─── Start menu ──────────────────────────────────────────────────────────────
export default function StartMenu({ onLaunch, onPower, onClose }: {
  onLaunch: (name: string) => void;
  onPower: (action: PowerAction) => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<"programs" | "all">("programs");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [picture, setPicture] = useState<string>(USER_PICTURE);
  const [powerOpen, setPowerOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const found = index.filter((i) => matches(i, query.trim()));
    return GROUP_ORDER.flatMap((g) => found.filter((i) => i.group === g));
  }, [index, query]);

  useEffect(() => setSelected(0), [query]);

  // Win7 puts the caret in the search box as soon as the menu opens (skip on touch: it pops the keyboard),
  // and typing anywhere while the menu is open goes to the search box
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      const input = searchRef.current;
      if (!input || document.activeElement === input || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
      input.focus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (query) setQuery(""); else onClose();
    } else if (e.key === "Enter" && results[selected]) {
      onLaunch(results[selected].name);
    } else if (e.key === "ArrowDown" && results.length) {
      e.preventDefault(); setSelected((s) => (s + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault(); setSelected((s) => (s - 1 + results.length) % results.length);
    }
  };

  const toggleFolder = (path: string) => setOpenFolders((prev) => {
    const s = new Set(prev);
    if (s.has(path)) s.delete(path); else s.add(path);
    return s;
  });

  const pinned = programs.filter((p) => p.pinned);
  const recent = programs.filter((p) => !p.pinned);
  const narrow = typeof window !== "undefined" && window.innerWidth < 560;

  return (
    <div className="w7sm" style={{ width: "min(400px, 100vw)", height: 436 }}>
      <style>{STYLES}</style>
      <div className="w7sm-glass" />

      {/* Left column: programs / All Programs / search results */}
      <div className="w7sm-left">
        {query.trim() ? (
          <div className="w7sm-list">
            {results.length === 0 && <div className="w7sm-empty">No items match your search.</div>}
            {GROUP_ORDER.map((group) => {
              const items = results.filter((r) => r.group === group);
              if (!items.length) return null;
              return (
                <React.Fragment key={group}>
                  <div className="w7sm-group">{group} ({items.length})</div>
                  {items.map((item) => {
                    const i = results.indexOf(item);
                    return (
                      <div
                        key={item.name}
                        className={`w7sm-item is-small${i === selected ? " is-selected" : ""}`}
                        onMouseEnter={() => setSelected(i)}
                        onClick={() => onLaunch(item.name)}
                      >
                        <img src={iconFor(item.name, 16)} width={16} height={16} alt="" />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        ) : view === "all" ? (
          <>
            <div className="w7sm-list">
              <AllProgramsTree entries={ALL_PROGRAMS} depth={0} open={openFolders} toggle={toggleFolder} onLaunch={onLaunch} />
            </div>
            <div className="w7sm-all">
              <div className="w7sm-sep" />
              <div className="w7sm-item" onClick={() => setView("programs")}>
                <div className="w7sm-tri is-left" />
                <span>Back</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w7sm-list">
              {pinned.map((p) => (
                <div key={p.name} className="w7sm-item is-big" onClick={() => onLaunch(p.name)}>
                  <img src={iconFor(p.name)} width={32} height={32} alt="" />
                  <span>{p.label ?? p.name}</span>
                </div>
              ))}
              {pinned.length > 0 && <div className="w7sm-sep" />}
              {recent.map((p) => (
                <div key={p.name} className="w7sm-item is-big" onClick={() => onLaunch(p.name)}>
                  <img src={iconFor(p.name)} width={32} height={32} alt="" />
                  <span>{p.label ?? p.name}</span>
                </div>
              ))}
            </div>
            <div className="w7sm-all">
              <div className="w7sm-sep" />
              <div className="w7sm-item" onClick={() => setView("all")}>
                <div className="w7sm-tri is-right" />
                <span>All Programs</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search box (sits on the glass under the white pane) */}
      <div className="w7sm-search">
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKey}
          placeholder="Search programs and files"
          aria-label="Search programs and files"
        />
        {query ? (
          <button className="is-clear" aria-label="Clear search" onClick={() => { setQuery(""); searchRef.current?.focus(); }}>
            <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 1l7 7M8 1L1 8" stroke="#4a4a4a" strokeWidth="1.4" /></svg>
          </button>
        ) : (
          <button aria-label="Search" tabIndex={-1} onClick={() => searchRef.current?.focus()}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.2" cy="5.2" r="3.9" stroke="#6b7c93" strokeWidth="1.5" />
              <path d="M8.2 8.2l3.6 3.6" stroke="#6b7c93" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* User picture: swaps to the hovered place's icon */}
      <div className="w7sm-pic" onClick={() => onLaunch("My Resume")}>
        <div>
          <img src={picture} alt={USER_NAME} onError={() => setPicture(USER_PICTURE)} />
        </div>
        <img className="w7sm-pic-frame" src={ICONS.userFrame} alt="" />
      </div>

      {/* Right column: places */}
      <div className="w7sm-right" onMouseLeave={() => setPicture(USER_PICTURE)}>
        {PLACES.map((place, i) => place === null ? (
          <div key={`sep-${i}`} className="w7sm-place-sep" />
        ) : (
          <div
            key={place}
            className="w7sm-place"
            onMouseEnter={() => setPicture(place === USER_NAME ? USER_PICTURE : iconFor(place, 48))}
            onClick={() => onLaunch(place === USER_NAME ? "My Resume" : place)}
          >
            {place}
          </div>
        ))}
      </div>

      {/* Shut down + power options */}
      <div className="w7sm-power">
        <button className="w7sm-pbtn" style={{ width: 82, borderRadius: "3px 0 0 3px" }} onClick={() => onPower("shutdown")}>
          Shut down
        </button>
        <button
          className={`w7sm-pbtn${powerOpen ? " is-open" : ""}`}
          style={{ width: 22, borderRadius: "0 3px 3px 0", borderLeft: "none" }}
          aria-label="Shut down options"
          onClick={() => setPowerOpen((o) => !o)}
        >
          <div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: "5px solid #fff", filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))" }} />
        </button>
        {powerOpen && (
          <div className="w7-menu" style={narrow ? { right: 0, bottom: 28 } : { left: "100%", bottom: 0, marginLeft: 2 }}>
            {POWER_ITEMS.map((action, i) => action === null ? (
              <div key={`sep-${i}`} className="w7-menu-sep" />
            ) : (
              <div key={action} className="w7-menu-item" onClick={() => { setPowerOpen(false); onPower(action); }}>
                {POWER_LABELS[action]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
