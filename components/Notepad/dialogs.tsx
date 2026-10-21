"use client";
import React, { useState } from "react";
import OwnedDialog from "../Win7/OwnedDialog";
import { Check, Radio, ListBox, MsgIcon } from "../Win7/dialogKit";
import { AddressBar, CommandBar, NavPane, FONT } from "../Win7/Chrome";
import { useDesktop } from "../Desktop/DesktopContext";

// Notepad's owned dialogs: Find, Replace, Go To Line, Font, Save As, About Notepad.

type Owned = {
  owner: React.RefObject<HTMLElement | null>;
  zIndex: number;
  onClose: () => void;
  onFocus?: () => void;
};

export type FindState = { what: string; replace: string; matchCase: boolean; down: boolean };

const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6 };
const btnCol: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 };

// ─── Find (modeless) ─────────────────────────────────────────────────────────
export function FindDialog({ state, setState, onFindNext, ...o }: Owned & {
  state: FindState; setState: (s: FindState) => void; onFindNext: () => void;
}) {
  return (
    <OwnedDialog title="Find" width={372} modal={false} {...o}>
      <form style={{ display: "flex", gap: 10 }} onSubmit={(e) => { e.preventDefault(); if (state.what) onFindNext(); }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={row}>
            <label htmlFor="np-find-what" style={{ flexShrink: 0 }}>Find what:</label>
            <input id="np-find-what" type="text" value={state.what} style={{ flex: 1, minWidth: 0 }}
              onChange={(e) => setState({ ...state, what: e.target.value })} />
          </div>
          <div style={{ ...row, justifyContent: "space-between", alignItems: "flex-end", marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ paddingBottom: 6 }}>
              <Check label="Match case" checked={state.matchCase} onChange={(v) => setState({ ...state, matchCase: v })} />
            </div>
            <fieldset style={{ padding: "2px 8px 6px", margin: 0 }}>
              <legend>Direction</legend>
              <div style={{ ...row, gap: 12 }}>
                <Radio name="np-dir" label="Up" checked={!state.down} onChange={() => setState({ ...state, down: false })} />
                <Radio name="np-dir" label="Down" checked={state.down} onChange={() => setState({ ...state, down: true })} />
              </div>
            </fieldset>
          </div>
        </div>
        <div style={btnCol}>
          <button type="submit" className="default" disabled={!state.what}>Find Next</button>
          <button type="button" onClick={o.onClose}>Cancel</button>
        </div>
      </form>
    </OwnedDialog>
  );
}

// ─── Replace (modeless) ──────────────────────────────────────────────────────
export function ReplaceDialog({ state, setState, onFindNext, onReplace, onReplaceAll, ...o }: Owned & {
  state: FindState; setState: (s: FindState) => void;
  onFindNext: () => void; onReplace: () => void; onReplaceAll: () => void;
}) {
  const label: React.CSSProperties = { width: 76, flexShrink: 0 };
  return (
    <OwnedDialog title="Replace" width={372} modal={false} {...o}>
      <form style={{ display: "flex", gap: 10 }} onSubmit={(e) => { e.preventDefault(); if (state.what) onFindNext(); }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={row}>
            <label htmlFor="np-rep-what" style={label}>Find what:</label>
            <input id="np-rep-what" type="text" value={state.what} style={{ flex: 1, minWidth: 0 }}
              onChange={(e) => setState({ ...state, what: e.target.value })} />
          </div>
          <div style={row}>
            <label htmlFor="np-rep-with" style={label}>Replace with:</label>
            <input id="np-rep-with" type="text" value={state.replace} style={{ flex: 1, minWidth: 0 }}
              onChange={(e) => setState({ ...state, replace: e.target.value })} />
          </div>
          <div style={{ marginTop: "auto", paddingBottom: 2 }}>
            <Check label="Match case" checked={state.matchCase} onChange={(v) => setState({ ...state, matchCase: v })} />
          </div>
        </div>
        <div style={btnCol}>
          <button type="submit" className="default" disabled={!state.what}>Find Next</button>
          <button type="button" disabled={!state.what} onClick={onReplace}>Replace</button>
          <button type="button" disabled={!state.what} onClick={onReplaceAll}>Replace All</button>
          <button type="button" onClick={o.onClose}>Cancel</button>
        </div>
      </form>
    </OwnedDialog>
  );
}

// ─── Go To Line (modal) ──────────────────────────────────────────────────────
export function GoToDialog({ line, onGo, ...o }: Owned & { line: number; onGo: (n: number) => void }) {
  const [value, setValue] = useState(String(line));
  const [balloon, setBalloon] = useState(false);
  return (
    <OwnedDialog title="Go To Line" width={258} {...o}
      footer={<>
        <button className="default" onClick={() => onGo(parseInt(value, 10) || 0)}>Go To</button>
        <button onClick={o.onClose}>Cancel</button>
      </>}
    >
      <form onSubmit={(e) => { e.preventDefault(); onGo(parseInt(value, 10) || 0); }} style={{ position: "relative" }}>
        <label htmlFor="np-goto" style={{ display: "block", marginBottom: 4 }}>Line number:</label>
        <input
          id="np-goto" type="text" inputMode="numeric" value={value} style={{ width: "100%" }}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            setBalloon(digits !== e.target.value);
            setValue(digits);
          }}
          onBlur={() => setBalloon(false)}
        />
        {balloon && (
          // Win7 edit-control balloon for ES_NUMBER fields
          <div role="tooltip" style={{
            position: "absolute", left: 6, top: 52, zIndex: 3, width: 228, padding: "8px 10px",
            background: "linear-gradient(#fff,#e4e5f0)", border: "1px solid #767676", borderRadius: 4,
            boxShadow: "2px 2px 4px rgba(0,0,0,.35)", fontSize: 12,
          }}>
            <div style={{ position: "absolute", top: -8, left: 14, width: 0, height: 0,
              borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "8px solid #767676" }} />
            <div style={{ position: "absolute", top: -7, left: 15, width: 0, height: 0,
              borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderBottom: "7px solid #fff" }} />
            <div style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 700, marginBottom: 4 }}>
              <MsgIcon kind="error" size={16} /> Unacceptable Character
            </div>
            You can only type a number here.
          </div>
        )}
      </form>
    </OwnedDialog>
  );
}

// ─── Font (modal) ────────────────────────────────────────────────────────────
export type NotepadFont = { family: string; style: string; size: number };

const FAMILIES = [
  "Arial", "Arial Black", "Calibri", "Cambria", "Candara", "Comic Sans MS", "Consolas", "Constantia",
  "Corbel", "Courier New", "Franklin Gothic Medium", "Georgia", "Impact", "Lucida Console",
  "Lucida Sans Unicode", "Palatino Linotype", "Segoe Print", "Segoe Script", "Segoe UI", "Tahoma",
  "Times New Roman", "Trebuchet MS", "Verdana",
];
const STYLES = ["Regular", "Italic", "Bold", "Bold Italic"];
const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export function fontCss(f: NotepadFont): React.CSSProperties {
  return {
    fontFamily: `"${f.family}", ${f.family === "Lucida Console" ? '"Lucida Console", Consolas, "DejaVu Sans Mono", monospace' : "sans-serif"}`,
    fontSize: `${f.size}pt`,
    fontWeight: f.style.includes("Bold") ? 700 : 400,
    fontStyle: f.style.includes("Italic") ? "italic" : "normal",
  };
}

export function FontDialog({ font, onApply, ...o }: Owned & { font: NotepadFont; onApply: (f: NotepadFont) => void }) {
  const { openApp } = useDesktop();
  const [f, setF] = useState(font);
  const [famText, setFamText] = useState(font.family);
  const [sizeText, setSizeText] = useState(String(font.size));
  const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 };
  const ok = () => {
    const size = parseInt(sizeText, 10);
    onApply({ ...f, size: size > 0 && size < 200 ? size : f.size });
  };
  return (
    <OwnedDialog title="Font" width={432} {...o}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1.15fr) minmax(0,.7fr)", gap: 12 }}>
        <div style={col}>
          <label htmlFor="np-font-fam">Font:</label>
          <input id="np-font-fam" type="text" value={famText} onChange={(e) => {
            setFamText(e.target.value);
            const m = FAMILIES.find((x) => x.toLowerCase().startsWith(e.target.value.toLowerCase()));
            if (m && e.target.value) setF({ ...f, family: m });
          }} />
          <ListBox items={FAMILIES} value={f.family} height={112}
            onChange={(v) => { setF({ ...f, family: v }); setFamText(v); }}
            render={(v) => <span style={{ fontFamily: `"${v}"` }}>{v}</span>} onActivate={ok} />
        </div>
        <div style={col}>
          <label htmlFor="np-font-style">Font style:</label>
          <input id="np-font-style" type="text" value={f.style} readOnly />
          <ListBox items={STYLES} value={f.style} height={112} onChange={(v) => setF({ ...f, style: v })}
            render={(v) => <span style={{ fontWeight: v.includes("Bold") ? 700 : 400, fontStyle: v.includes("Italic") ? "italic" : "normal" }}>{v}</span>}
            onActivate={ok} />
        </div>
        <div style={col}>
          <label htmlFor="np-font-size">Size:</label>
          <input id="np-font-size" type="text" inputMode="numeric" value={sizeText}
            onChange={(e) => { setSizeText(e.target.value.replace(/\D/g, "")); const n = parseInt(e.target.value, 10); if (n) setF({ ...f, size: n }); }} />
          <ListBox items={SIZES} value={SIZES.includes(f.size) ? f.size : null} height={112}
            onChange={(v) => { setF({ ...f, size: v }); setSizeText(String(v)); }} onActivate={ok} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 120px" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); openApp("Control Panel"); }}>Show more fonts</a>
        </div>
        <div style={{ flex: "0 1 228px", minWidth: 0 }}>
          <fieldset style={{ margin: 0, padding: "4px 8px 8px" }}>
            <legend>Sample</legend>
            <div style={{
              height: 44, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              ...fontCss({ ...f, size: Math.min(f.size, 20) }),
            }}>AaBbYyZz</div>
          </fieldset>
          <label htmlFor="np-font-script" style={{ display: "block", margin: "8px 0 3px" }}>Script:</label>
          <select id="np-font-script" style={{ width: "100%" }} defaultValue="Western">
            <option>Western</option><option>Greek</option><option>Turkish</option>
            <option>Baltic</option><option>Central European</option><option>Cyrillic</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <button className="default" onClick={ok}>OK</button>
        <button onClick={o.onClose}>Cancel</button>
      </div>
    </OwnedDialog>
  );
}

// ─── Save As (modal, Win7 common file dialog) ────────────────────────────────
export type Encoding = "ANSI" | "Unicode" | "Unicode big endian" | "UTF-8";

const PLACES: Record<string, string[]> = {
  Desktop: ["Desktop"], Downloads: ["Downloads"], "Recent Places": ["Recent Places"],
  Libraries: ["Libraries"], Documents: ["Libraries", "Documents"], Music: ["Libraries", "Music"],
  Pictures: ["Libraries", "Pictures"], Videos: ["Libraries", "Videos"], Computer: ["Computer"],
  "Local Disk (C:)": ["Computer", "Local Disk (C:)"], "DVD RW Drive (D:)": ["Computer", "DVD RW Drive (D:)"],
  Network: ["Network"],
};

export function SaveAsDialog({ fileName, onSave, ...o }: Owned & {
  fileName: string | null; onSave: (name: string, encoding: Encoding) => void;
}) {
  const [loc, setLoc] = useState("Documents");
  const [history, setHistory] = useState<string[]>([]);
  const [name, setName] = useState(fileName ?? "*.txt");
  const [type, setType] = useState("txt");
  const [encoding, setEncoding] = useState<Encoding>("ANSI");
  const [folders, setFolders] = useState(true);
  const narrow = typeof window !== "undefined" && window.innerWidth < 560;

  const go = (label: string) => {
    if (!PLACES[label] || label === loc) return;
    setHistory((h) => [...h, loc]);
    setLoc(label);
  };
  const save = () => {
    let n = name.trim();
    if (!n || /[*?]/.test(n)) n = "Untitled.txt";
    if (type === "txt" && !/\.[^.\\/]+$/.test(n)) n += ".txt";
    onSave(n, encoding);
  };
  const isLibrary = PLACES[loc][0] === "Libraries" && loc !== "Libraries";
  const fieldLabel: React.CSSProperties = { width: 84, flexShrink: 0, textAlign: "right" };

  return (
    <OwnedDialog title="Save As" width={640} {...o} bodyStyle={{ padding: 0, background: "#f0f0f0" }}>
      {folders && (<>
        <AddressBar
          icon="/icons/win7/folder.svg" path={PLACES[loc]} searchPlaceholder={`Search ${loc}`}
          onBack={history.length ? () => { setLoc(history[history.length - 1]); setHistory((h) => h.slice(0, -1)); } : undefined}
        />
        <CommandBar commands={[{ label: "Organize", arrow: true, disabled: true }, { label: "New folder", disabled: true }]} />
        <div style={{ display: "flex", height: 230, background: "#fff", borderBottom: "1px solid #c8c8c8" }}>
          {!narrow && <NavPane navSel={loc} onSelect={go} />}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", fontFamily: FONT }}>
            {isLibrary && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px 4px",
                background: "linear-gradient(#fff,#f4f8fd)", borderBottom: "1px solid #e3e8f0",
              }}>
                <div>
                  <div style={{ fontSize: 15, color: "#1e3287" }}>{loc} library</div>
                  <div style={{ fontSize: 11, color: "#444" }}>Includes: <span style={{ color: "#0066cc" }}>2 locations</span></div>
                </div>
                <div style={{ fontSize: 11, color: "#444" }}>Arrange by: <span style={{ color: "#0066cc" }}>Folder ▾</span></div>
              </div>
            )}
            <div style={{ display: "flex", fontSize: 12, color: "#4c607a", borderBottom: "1px solid #e5e5e5", height: 24, alignItems: "center" }}>
              {["Name", "Date modified", "Type", "Size"].filter((c, i) => !narrow || i === 0).map((c, i) => (
                <div key={c} style={{ flex: i === 0 ? 2 : 1, padding: "0 8px", borderRight: "1px solid #e5e5e5", whiteSpace: "nowrap" }}>{c}</div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", paddingTop: 14, fontSize: 12, color: "#6d6d6d" }}>
              No items match your search.
            </div>
          </div>
        </div>
      </>)}

      <form
        onSubmit={(e) => { e.preventDefault(); save(); }}
        style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, fontFamily: FONT }}
      >
        <div style={row}>
          <label htmlFor="np-save-name" style={fieldLabel}>File name:</label>
          <input id="np-save-name" data-autofocus type="text" value={name} style={{ flex: 1, minWidth: 0 }}
            onFocus={(e) => e.target.select()} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={row}>
          <label htmlFor="np-save-type" style={fieldLabel}>Save as type:</label>
          <select id="np-save-type" value={type} onChange={(e) => setType(e.target.value)} style={{ flex: 1, minWidth: 0 }}>
            <option value="txt">Text Documents (*.txt)</option>
            <option value="all">All Files  (*.*)</option>
          </select>
        </div>
        <div style={{ ...row, marginTop: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setFolders(!folders); }}
            style={{ marginRight: "auto", display: "flex", alignItems: "center", gap: 5, color: "#1e3287" }}>
            <span style={{
              width: 15, height: 15, borderRadius: "50%", border: "1px solid #8b9bb4", display: "inline-flex",
              alignItems: "center", justifyContent: "center", fontSize: 8, background: "linear-gradient(#fff,#dde6f2)",
            }}>{folders ? "▲" : "▼"}</span>
            {folders ? "Hide Folders" : "Browse Folders"}
          </a>
          <label htmlFor="np-save-enc">Encoding:</label>
          <select id="np-save-enc" value={encoding} onChange={(e) => setEncoding(e.target.value as Encoding)} style={{ width: 120 }}>
            <option>ANSI</option><option>Unicode</option><option>Unicode big endian</option><option>UTF-8</option>
          </select>
          <button type="submit" className="default">Save</button>
          <button type="button" onClick={o.onClose}>Cancel</button>
        </div>
      </form>
    </OwnedDialog>
  );
}

// ─── About Notepad (modal) ───────────────────────────────────────────────────
function WindowsFlag({ size }: { size: number }) {
  // the waving four-pane Windows 7 flag
  const pane = (d: string, c1: string, c2: string, id: string) => (<>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
    <path d={d} fill={`url(#${id})`} />
  </>);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      {pane("M4 12c8-4 16-4 25 0l-4 19c-8-4-16-4-25 0z", "#ff8a5c", "#e83b16", "wf-r")}
      {pane("M32 13c8 4 16 4 25 0l-4 19c-8 4-16 4-25 0z", "#bde55c", "#5fa81c", "wf-g")}
      {pane("M0 34c8-4 16-4 25 0l-4 19c-8-4-16-4-25 0z", "#7fd0ff", "#1a8de0", "wf-b")}
      {pane("M28 35c8 4 16 4 25 0l-4 19c-8 4-16 4-25 0z", "#ffe27a", "#f5b400", "wf-y")}
    </svg>
  );
}

export function AboutDialog(o: Owned) {
  return (
    <OwnedDialog title="About Notepad" width={456} bright {...o}
      footer={<button className="default" data-autofocus onClick={o.onClose}>OK</button>}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "6px 0 12px" }}>
        <WindowsFlag size={58} />
        <div style={{ fontFamily: FONT, lineHeight: 1 }}>
          <span style={{ fontSize: 36, fontWeight: 300, color: "#333" }}>Windows</span>
          <span style={{ fontSize: 40, fontWeight: 300, color: "#333", marginLeft: 6 }}>7</span>
          <div style={{ fontSize: 15, color: "#555", marginTop: 2, letterSpacing: 0.3 }}>Ultimate</div>
        </div>
      </div>
      <div style={{ height: 1, background: "#cfcfcf", margin: "0 0 12px" }} />
      <div style={{ lineHeight: 1.45, paddingLeft: 40 }}>
        Microsoft Windows<br />
        Version 6.1 (Build 7601: Service Pack 1)<br />
        Copyright © 2009 Microsoft Corporation. All rights reserved.<br />
        The Windows 7 Ultimate operating system and its user interface are protected by trademark and other pending or existing intellectual property rights in the United States and other countries.
        <br /><br />
        This product is licensed under the <a href="https://www.microsoft.com/en-us/useterms" target="_blank" rel="noreferrer">Microsoft Software License Terms</a> to:
        <div style={{ paddingLeft: 16, marginTop: 4 }}>Animesh</div>
      </div>
    </OwnedDialog>
  );
}
