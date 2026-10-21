"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { TitleBar } from "../Win7/Chrome";
import OwnedDialog from "../Win7/OwnedDialog";
import { MessageBox } from "../Win7/dialogKit";
import { useDesktop } from "../Desktop/DesktopContext";
import MenuBar, { mnemonicOf, type Menu } from "./MenuBar";
import { useTypewriter } from "./Typing";
import {
  FindDialog, ReplaceDialog, GoToDialog, FontDialog, SaveAsDialog, AboutDialog, fontCss,
  type FindState, type NotepadFont, type Encoding,
} from "./dialogs";

type DialogKind = null | "find" | "replace" | "goto" | "font" | "saveAs" | "about";
type Message = { title: string; text: string; icon?: "info" | "warning" | "error" };

// Win7 Notepad saves CRLF in the chosen encoding
function encode(text: string, enc: Encoding): BlobPart[] {
  const s = text.replace(/\r?\n/g, "\r\n");
  if (enc === "UTF-8") return [new Uint8Array([0xef, 0xbb, 0xbf]), s];
  if (enc === "Unicode" || enc === "Unicode big endian") {
    const le = enc === "Unicode";
    const buf = new Uint8Array(2 + s.length * 2);
    buf[0] = le ? 0xff : 0xfe;
    buf[1] = le ? 0xfe : 0xff;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      buf[2 + i * 2] = le ? c & 255 : c >> 8;
      buf[3 + i * 2] = le ? c >> 8 : c & 255;
    }
    return [buf];
  }
  return [s];
}

function download(name: string, text: string, enc: Encoding) {
  const url = URL.createObjectURL(new Blob(encode(text, enc), { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Pixel offset of `pos` inside the textarea, via an off-screen mirror
function caretOffset(t: HTMLTextAreaElement, pos: number) {
  const cs = getComputedStyle(t);
  const div = document.createElement("div");
  for (const p of ["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing",
    "paddingTop", "paddingLeft", "paddingRight", "whiteSpace", "overflowWrap", "wordBreak", "tabSize"] as const) {
    div.style[p] = cs[p];
  }
  Object.assign(div.style, { position: "absolute", visibility: "hidden", top: "0", left: "-99999px", width: `${t.clientWidth}px` });
  div.textContent = t.value.slice(0, pos);
  const span = document.createElement("span");
  span.textContent = t.value.slice(pos, pos + 1) || ".";
  div.appendChild(span);
  document.body.appendChild(div);
  const r = { top: span.offsetTop, left: span.offsetLeft };
  div.remove();
  return r;
}

function timeDate() {
  const d = new Date();
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "AM" : "PM"} ${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function Grip() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" style={{ alignSelf: "flex-end", margin: "0 1px 1px 2px", flexShrink: 0 }}>
      {[[9, 9], [9, 5], [5, 9], [9, 1], [5, 5], [1, 9]].map(([x, y]) => (
        <g key={`${x}-${y}`}><rect x={x + 1} y={y + 1} width="2" height="2" fill="#fff" /><rect x={x} y={y} width="2" height="2" fill="#a0a0a0" /></g>
      ))}
    </svg>
  );
}

function Notepad({ handleClose, zIndex, onFocus, minimized, onMinimize }: { handleClose: () => void; zIndex: number; onFocus?: () => void; minimized?: boolean; onMinimize?: () => void }) {
  const { openApp } = useDesktop();
  const root = useRef<HTMLDivElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const lastSel = useRef({ start: 0, end: 0 });
  const afterSave = useRef<(() => void) | null>(null);

  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [encoding, setEncoding] = useState<Encoding>("ANSI");
  const [dirty, setDirty] = useState(false);
  const [edited, setEdited] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [statusBar, setStatusBar] = useState(false);
  const [font, setFont] = useState<NotepadFont>({ family: "Lucida Console", style: "Regular", size: 10 });
  const [caret, setCaret] = useState({ ln: 1, col: 1 });
  const [hasSel, setHasSel] = useState(false);
  const [menu, setMenu] = useState<number | null>(null);
  const [cues, setCues] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [prompt, setPrompt] = useState<(() => void) | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [find, setFind] = useState<FindState>({ what: "", replace: "", matchCase: false, down: true });

  const { stop } = useTypewriter(useCallback((t: string) => setText(t), []), !!minimized);
  const dz = 1001 + zIndex;
  const docName = fileName ?? "Untitled";
  const showStatus = statusBar && !wrap;

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) ta.current?.focus();
  }, []);

  // ─── selection helpers ─────────────────────────────────────────────────────
  const updateCaret = useCallback(() => {
    const t = ta.current;
    if (!t) return;
    const pos = t.selectionDirection === "backward" ? t.selectionStart : t.selectionEnd;
    const before = t.value.slice(0, pos);
    setCaret({ ln: before.split("\n").length, col: pos - before.lastIndexOf("\n") });
    setHasSel(t.selectionStart !== t.selectionEnd);
    lastSel.current = { start: t.selectionStart, end: t.selectionEnd };
  }, []);

  const restoreSel = () => {
    const t = ta.current!;
    t.focus();
    t.setSelectionRange(lastSel.current.start, lastSel.current.end);
    return t;
  };

  const select = (s: number, e: number, focus: boolean) => {
    const t = ta.current!;
    if (focus) t.focus();
    t.setSelectionRange(s, e);
    const off = caretOffset(t, s);
    t.scrollTop = Math.max(0, off.top - t.clientHeight / 2);
    if (!wrap) t.scrollLeft = Math.max(0, off.left - t.clientWidth / 2);
    updateCaret();
  };

  const insertText = (str: string) => {
    const t = restoreSel();
    // execCommand keeps the edit on the native undo stack
    const ok = str ? document.execCommand("insertText", false, str) : document.execCommand("delete");
    if (!ok) {
      t.setRangeText(str, t.selectionStart, t.selectionEnd, "end");
      setText(t.value);
      setDirty(true);
      setEdited(true);
    }
    updateCaret();
  };

  // ─── commands ──────────────────────────────────────────────────────────────
  const guard = (then: () => void) => (dirty ? setPrompt(() => then) : then());

  const newDoc = () => guard(() => {
    setText(""); setFileName(null); setDirty(false); setEdited(false);
    lastSel.current = { start: 0, end: 0 };
    setCaret({ ln: 1, col: 1 });
    ta.current?.focus();
  });
  const openDoc = () => guard(() => fileInput.current?.click());
  const save = () => {
    if (fileName) { download(fileName, text, encoding); setDirty(false); afterSave.current?.(); afterSave.current = null; }
    else setDialog("saveAs");
  };
  const print = () => {
    const frame = document.createElement("iframe");
    Object.assign(frame.style, { position: "fixed", width: "0", height: "0", border: "0", right: "0", bottom: "0" });
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const f = fontCss(font);
    doc.open();
    doc.write(`<title>${esc(docName)}</title><style>@page{margin:0.75in}body{margin:0}h1{font:9pt Arial;text-align:center;margin:0 0 12pt}pre{white-space:pre-wrap;margin:0;font-family:${f.fontFamily};font-size:${f.fontSize};font-weight:${f.fontWeight};font-style:${f.fontStyle}}</style><h1>${esc(docName)}</h1><pre>${esc(text)}</pre>`);
    doc.close();
    frame.contentWindow!.onafterprint = () => frame.remove();
    frame.contentWindow!.print();
    setTimeout(() => frame.remove(), 60000);
  };
  const exit = () => guard(handleClose);

  const undo = () => { restoreSel(); document.execCommand("undo"); updateCaret(); };
  const selected = () => text.slice(lastSel.current.start, lastSel.current.end);
  const cut = () => {
    restoreSel();
    if (!document.execCommand("cut")) navigator.clipboard?.writeText(selected()).then(() => insertText(""));
    updateCaret();
  };
  const copy = () => { restoreSel(); if (!document.execCommand("copy")) navigator.clipboard?.writeText(selected()); };
  const paste = () => {
    restoreSel();
    navigator.clipboard?.readText().then((s) => s && insertText(s)).catch(() => {});
  };
  const del = () => insertText("");
  const selectAll = () => { const t = ta.current!; t.focus(); t.select(); updateCaret(); };

  const findNext = (st: FindState = find, focus = dialog === null): boolean => {
    if (!st.what) { setDialog("find"); return false; }
    const t = ta.current!;
    const hay = st.matchCase ? t.value : t.value.toLowerCase();
    const needle = st.matchCase ? st.what : st.what.toLowerCase();
    const { start, end } = lastSel.current;
    const idx = st.down ? hay.indexOf(needle, end) : start > 0 ? hay.lastIndexOf(needle, start - 1) : -1;
    if (idx < 0) { setMessage({ title: "Notepad", text: `Cannot find "${st.what}"`, icon: "info" }); return false; }
    select(idx, idx + needle.length, focus);
    return true;
  };
  const replaceOne = () => {
    const sel = selected();
    const same = find.matchCase ? sel === find.what : sel.toLowerCase() === find.what.toLowerCase();
    if (sel && same) insertText(find.replace);
    findNext({ ...find, down: true }, false);
  };
  const replaceAll = () => {
    const re = new RegExp(find.what.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), find.matchCase ? "g" : "gi");
    const next = text.replace(re, () => find.replace);
    if (next === text) return;
    lastSel.current = { start: 0, end: text.length };
    insertText(next);
  };
  const goTo = (n: number) => {
    const lines = text.split("\n");
    if (n < 1 || n > lines.length) {
      setMessage({ title: "Notepad - Goto Line", text: "The line number is beyond the total number of lines" });
      return;
    }
    const pos = lines.slice(0, n - 1).reduce((a, l) => a + l.length + 1, 0);
    setDialog(null);
    select(pos, pos, true);
  };

  const run = (fn: () => void) => () => { stop(); fn(); };

  const menus: Menu[] = [
    { label: "&File", items: [
      { label: "&New", shortcut: "Ctrl+N", onClick: run(newDoc) },
      { label: "&Open...", shortcut: "Ctrl+O", onClick: run(openDoc) },
      { label: "&Save", shortcut: "Ctrl+S", onClick: run(save) },
      { label: "Save &As...", onClick: run(() => setDialog("saveAs")) },
      { separator: true },
      { label: "Page Set&up...", onClick: () => {}, disabled: true },
      { label: "&Print...", shortcut: "Ctrl+P", onClick: run(print) },
      { separator: true },
      { label: "E&xit", onClick: run(exit) },
    ] },
    { label: "&Edit", items: [
      { label: "&Undo", shortcut: "Ctrl+Z", onClick: run(undo), disabled: !edited },
      { separator: true },
      { label: "Cu&t", shortcut: "Ctrl+X", onClick: run(cut), disabled: !hasSel },
      { label: "&Copy", shortcut: "Ctrl+C", onClick: run(copy), disabled: !hasSel },
      { label: "&Paste", shortcut: "Ctrl+V", onClick: run(paste) },
      { label: "De&lete", shortcut: "Del", onClick: run(del), disabled: !hasSel },
      { separator: true },
      { label: "&Find...", shortcut: "Ctrl+F", onClick: run(() => setDialog("find")), disabled: !text },
      { label: "Find &Next", shortcut: "F3", onClick: run(() => findNext()), disabled: !text },
      { label: "&Replace...", shortcut: "Ctrl+H", onClick: run(() => setDialog("replace")) },
      { label: "&Go To...", shortcut: "Ctrl+G", onClick: run(() => setDialog("goto")), disabled: wrap },
      { separator: true },
      { label: "Select &All", shortcut: "Ctrl+A", onClick: run(selectAll) },
      { label: "Time/&Date", shortcut: "F5", onClick: run(() => insertText(timeDate())) },
    ] },
    { label: "F&ormat", items: [
      { label: "&Word Wrap", onClick: run(() => setWrap((w) => !w)), checked: wrap },
      { label: "&Font...", onClick: run(() => setDialog("font")) },
    ] },
    { label: "&View", items: [
      { label: "&Status Bar", onClick: run(() => setStatusBar((s) => !s)), checked: showStatus, disabled: wrap },
    ] },
    { label: "&Help", items: [
      { label: "View &Help", onClick: run(() => openApp("Help and Support")) },
      { separator: true },
      { label: "&About Notepad", onClick: run(() => setDialog("about")) },
    ] },
  ];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Alt") { setCues(true); return; }
    if (e.altKey && !e.ctrlKey && e.key.length === 1) {
      const i = menus.findIndex((m) => mnemonicOf(m.label) === e.key.toLowerCase());
      if (i >= 0) { e.preventDefault(); setMenu(i); }
      return;
    }
    const shortcuts: Record<string, () => void> = e.ctrlKey && !e.altKey && !e.shiftKey ? {
      n: newDoc, o: openDoc, s: save, p: print,
      f: () => text && setDialog("find"), h: () => setDialog("replace"), g: () => !wrap && setDialog("goto"),
    } : {};
    const fn = shortcuts[e.key.toLowerCase()] ?? (e.key === "F3" ? () => text && findNext() : e.key === "F5" ? () => insertText(timeDate()) : null);
    if (fn) { e.preventDefault(); stop(); fn(); }
  };

  const owned = { owner: root, zIndex: dz, onClose: () => setDialog(null), onFocus };

  return (
    <DraggableWindow
      cancelSelector=".np-client"
      zIndex={zIndex}
      width="640px"
      height="440px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <style>{`
        .np-text::-webkit-scrollbar { display: block; }
        .np-text::selection { background: #3399ff; color: #fff; }
        @media (pointer: coarse) { .np-text::-webkit-scrollbar { display: none; } }
      `}</style>
      <div
        ref={root}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => { if (e.key === "Alt" && menu === null) setCues(false); }}
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
      >
        <TitleBar title={`${docName} - Notepad`} icon="/icons/notepad.png" onClose={exit} />
        <div className="np-client window-body" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <MenuBar menus={menus} open={menu} onOpenChange={(i) => { setMenu(i); if (i === null) setCues(false); }} cues={cues} />
          <textarea
            ref={ta}
            className="np-text has-scrollbar"
            spellCheck={false}
            wrap={wrap ? "soft" : "off"}
            value={text}
            aria-label="Text editor"
            onChange={(e) => { stop(); setText(e.target.value); setDirty(true); setEdited(true); updateCaret(); }}
            onSelect={updateCaret}
            onKeyUp={updateCaret}
            onClick={updateCaret}
            onKeyDown={(e) => { if (!["Shift", "Control", "Alt", "Meta"].includes(e.key)) stop(); }}
            onPointerDown={stop}
            style={{
              flex: 1, minHeight: 0, width: "100%", margin: 0, padding: "0 2px", resize: "none",
              border: "none", borderTop: "1px solid #ccd3e0", borderRadius: 0, outline: "none", boxShadow: "none",
              background: "#fff", color: "#000", lineHeight: 1.2,
              whiteSpace: wrap ? "pre-wrap" : "pre", overflowX: wrap ? "hidden" : "scroll", overflowY: "scroll",
              ...fontCss(font),
            }}
          />
          {showStatus && (
            <div style={{
              display: "flex", height: 22, flexShrink: 0, background: "#f0f0f0",
              borderTop: "1px solid #d7d7d7", fontSize: 12, color: "#000",
            }}>
              <div style={{ flex: 1 }} />
              <div style={{
                width: "30%", minWidth: 120, display: "flex", alignItems: "center", padding: "0 4px",
                borderLeft: "1px solid #d7d7d7", boxShadow: "inset 1px 0 #fff", whiteSpace: "pre",
              }}>{`   Ln ${caret.ln}, Col ${caret.col}`}</div>
              <Grip />
            </div>
          )}
        </div>
        <input
          ref={fileInput} type="file" accept=".txt,text/plain" style={{ display: "none" }}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            stop();
            setText((await f.text()).replace(/\r\n/g, "\n"));
            setFileName(f.name); setDirty(false); setEdited(false);
            lastSel.current = { start: 0, end: 0 };
          }}
        />
      </div>

      {dialog === "find" && (
        <FindDialog {...owned} state={find} setState={setFind} onFindNext={() => findNext(find, false)} />
      )}
      {dialog === "replace" && (
        <ReplaceDialog {...owned} state={find} setState={setFind}
          onFindNext={() => findNext({ ...find, down: true }, false)} onReplace={replaceOne} onReplaceAll={replaceAll} />
      )}
      {dialog === "goto" && <GoToDialog {...owned} line={caret.ln} onGo={goTo} />}
      {dialog === "font" && <FontDialog {...owned} font={font} onApply={(f) => { setFont(f); setDialog(null); }} />}
      {dialog === "about" && <AboutDialog {...owned} />}
      {dialog === "saveAs" && (
        <SaveAsDialog
          {...owned}
          onClose={() => { afterSave.current = null; setDialog(null); }}
          fileName={fileName}
          onSave={(name, enc) => {
            download(name, text, enc);
            setFileName(name); setEncoding(enc); setDirty(false); setDialog(null);
            afterSave.current?.();
            afterSave.current = null;
          }}
        />
      )}

      {prompt && (
        <OwnedDialog
          title="Notepad" width={384} bright owner={root} zIndex={dz + 1} onClose={() => setPrompt(null)}
          footer={<>
            <button className="default" data-autofocus onClick={() => { afterSave.current = prompt; setPrompt(null); save(); }}>Save</button>
            <button onClick={() => { const then = prompt; setPrompt(null); setDirty(false); then(); }}>Don&apos;t Save</button>
            <button onClick={() => setPrompt(null)}>Cancel</button>
          </>}
        >
          <div className="instruction instruction-primary" style={{ margin: "4px 2px 16px" }}>
            Do you want to save changes to {docName}?
          </div>
        </OwnedDialog>
      )}
      {message && (
        <MessageBox title={message.title} icon={message.icon} text={message.text} owner={root} zIndex={dz + 1} onClose={() => setMessage(null)} />
      )}
    </DraggableWindow>
  );
}

export default Notepad;
