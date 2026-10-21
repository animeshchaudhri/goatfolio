"use client";
import React, { useState } from "react";
import type { WindowProps } from "../Desktop/windows";
import { APPS, iconPath } from "../Desktop/apps";
import { FONT } from "./Chrome";
import { CPWindow, Heading, Link, TaskPane, useNarrow, useNav, useOpen, CP_GREEN } from "./ControlPanelShell";

// Default Programs and its four sub pages, populated with this desktop's own programs.

const app = (name: string) => APPS[name]?.icon ?? "";
const ICONS = {
  window: app("Default Programs"),
  setDefaults: app("Default Programs"),
  associate: "win7:file-generic",
  autoPlay: "win7:autoplay",
  programAccess: "win7:computer",
  mediaPlayer: "win7:wmp",
  go: "/icons/win7/cp-go.svg",
};

type Program = { name: string; app: string; icon: string; desc: string; handles: string[] };

const PROGRAMS: Program[] = [
  { name: "Internet Explorer", app: "Internet Explorer", icon: app("Internet Explorer"), handles: [".htm", ".html", "http", "https"],
    desc: "Finds and displays information and Web sites on the Internet." },
  { name: "Notepad", app: "Notepad", icon: app("Notepad"), handles: [".txt", ".log"],
    desc: "Creates and edits text files using basic text formatting." },
  { name: "Windows Media Player", app: "Videos", icon: ICONS.mediaPlayer, handles: [".mp4", ".mp3"],
    desc: "Plays digital media including music and videos." },
  { name: "My Blog", app: "My Blog", icon: app("My Blog"), handles: [".md"],
    desc: "Reads Animesh's blog posts about code, projects and random things." },
  { name: "My Resume", app: "My Resume", icon: "win7:documents", handles: [".pdf"],
    desc: "Shows Animesh's resume: experience, projects, publications and awards." },
  { name: "Windows Live Messenger", app: "Chat", icon: app("Chat"), handles: ["mailto"],
    desc: "Sends Animesh a message." },
  { name: "Doom", app: "Doom", icon: "win7:games", handles: [".wad"],
    desc: "Runs the classic 1993 first-person shooter in your browser." },
];

const TYPES: { ext: string; desc: string }[] = [
  { ext: ".htm", desc: "HTML Document" }, { ext: ".html", desc: "HTML Document" },
  { ext: ".log", desc: "Text Document" }, { ext: ".md", desc: "Markdown File" },
  { ext: ".mp3", desc: "MP3 Format Sound" }, { ext: ".mp4", desc: "MP4 Video" },
  { ext: ".pdf", desc: "PDF File" }, { ext: ".txt", desc: "Text Document" },
  { ext: ".wad", desc: "DOOM WAD File" },
  { ext: "http", desc: "URL:HyperText Transfer Protocol" }, { ext: "https", desc: "URL:HyperText Transfer Protocol with Privacy" },
  { ext: "mailto", desc: "URL:MailTo Protocol" },
];

const MEDIA = [
  "Audio CD", "Enhanced audio CD", "DVD movie", "Enhanced DVD movie", "Software and games",
  "Pictures", "Video files", "Audio files", "Blank CD", "Blank DVD", "Mixed content",
];
const AUTOPLAY_ACTIONS = [
  "Choose a default", "Play using Windows Media Player", "Open folder to view files using Windows Explorer",
  "Take no action", "Ask me every time",
];

const defaultsFor = (): Record<string, string> =>
  Object.fromEntries(TYPES.map((t) => [t.ext, PROGRAMS.find((p) => p.handles.includes(t.ext))?.name ?? "Internet Explorer"]));

function ProgIcon({ name, size }: { name: string; size: number }) {
  const p = PROGRAMS.find((x) => x.name === name);
  return <img src={iconPath(p?.icon, size)} width={size} height={size} alt="" style={{ flexShrink: 0, objectFit: "contain" }} />;
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "auto", paddingTop: 14 }}>{children}</div>;
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function HomeView({ go }: { go: (v: View) => void }) {
  const options: { title: string; desc: string; view: View; icon: string }[] = [
    { title: "Set your default programs", view: "defaults", icon: ICONS.setDefaults,
      desc: "Make a program the default for all file types and protocols it can open." },
    { title: "Associate a file type or protocol with a program", view: "associate", icon: ICONS.associate,
      desc: "Make a file type or protocol (such as .mp3 or http://) always open in a specific program." },
    { title: "Change AutoPlay settings", view: "autoplay", icon: ICONS.autoPlay,
      desc: "Play CDs or other media automatically" },
    { title: "Set program access and computer defaults", view: "access", icon: ICONS.programAccess,
      desc: "Control access to certain programs and set defaults for this computer." },
  ];
  return (
    <>
      <Heading>Choose the programs that Windows uses by default</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
        {options.map((o) => (
          <div key={o.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <img src={iconPath(o.icon, 32)} width={32} height={32} alt="" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => go(o.view)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Link className="cp-cat" onClick={() => go(o.view)}>{o.title}</Link>
              <span style={{ color: "#333" }}>{o.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DefaultsView({ assoc, setAssoc, done, onChoose }: {
  assoc: Record<string, string>; setAssoc: (a: Record<string, string>) => void; done: () => void; onChoose: () => void;
}) {
  const open = useOpen();
  const narrow = useNarrow();
  const [sel, setSel] = useState(PROGRAMS[0].name);
  const prog = PROGRAMS.find((p) => p.name === sel)!;
  const owned = prog.handles.filter((h) => assoc[h] === prog.name).length;

  return (
    <>
      <Heading>Set your default programs</Heading>
      <div style={{ color: "#333", marginBottom: 10 }}>
        To set a program as the default for all file types and protocols it can open, click the program and then click Set as default.
      </div>
      <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", gap: 12, flex: 1, minHeight: 0 }}>
        <div style={{ width: narrow ? "100%" : 220, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: narrow ? 150 : 0 }}>
          <div style={{ marginBottom: 4 }}>Programs</div>
          <div role="listbox" style={{ flex: 1, overflowY: "auto", padding: 2 }}>
            {PROGRAMS.map((p) => (
              <div key={p.name}
                role="option"
                aria-selected={p.name === sel}
                onClick={() => setSel(p.name)}
                onDoubleClick={() => open(p.app)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "3px 4px", cursor: "default",
                  background: p.name === sel ? "#3399ff" : "transparent", color: p.name === sel ? "#fff" : "#000",
                }}>
                <ProgIcon name={p.name} size={16} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8, borderBottom: "1px solid #e3e8ef" }}>
            <ProgIcon name={prog.name} size={32} />
            <div>
              <div style={{ fontSize: 14 }}>{prog.name}</div>
              <div style={{ color: "#666" }}>Animesh Chaudhri</div>
            </div>
          </div>
          <div style={{ color: "#333" }}>{prog.desc}</div>
          <div style={{ color: "#333" }}>
            {owned === prog.handles.length
              ? "This program has all its defaults"
              : `This program has ${owned} out of ${prog.handles.length} defaults`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
            <ActionLink
              title="Set this program as default"
              desc="Use the selected program to open all file types and protocols it can open by default."
              onClick={() => setAssoc({ ...assoc, ...Object.fromEntries(prog.handles.map((h) => [h, prog.name])) })}
            />
            <ActionLink
              title="Choose defaults for this program"
              desc="Choose which file types and protocols the selected program opens by default."
              onClick={onChoose}
            />
          </div>
        </div>
      </div>
      <Footer><button onClick={done}>OK</button></Footer>
    </>
  );
}

function ActionLink({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <div style={{ display: "flex", gap: 8, cursor: "pointer" }} onClick={onClick}>
      <img src={ICONS.go} width={14} height={14} alt="" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <span className="cp-link" style={{ color: CP_GREEN, fontSize: 13 }}>{title}</span>
        <div style={{ color: "#555", marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}

function AssociateView({ assoc, setAssoc, done }: {
  assoc: Record<string, string>; setAssoc: (a: Record<string, string>) => void; done: () => void;
}) {
  const [sel, setSel] = useState(TYPES[0].ext);
  const [choosing, setChoosing] = useState(false);
  const cell: React.CSSProperties = { padding: "2px 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

  return (
    <>
      <Heading>Associate a file type or protocol with a specific program</Heading>
      <div style={{ color: "#333", marginBottom: 8 }}>
        Click on an extension to view the program that currently opens it by default. To change the default program, click Change program.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, position: "relative" }}>
        <ProgIcon name={assoc[sel]} size={16} />
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{assoc[sel]}</span>
        <button onClick={() => setChoosing((c) => !c)}>Change program...</button>
        {choosing && (
          <div style={{
            position: "absolute", right: 0, top: 28, zIndex: 10, width: 230, background: "#fff",
            border: "1px solid #646464", boxShadow: "2px 2px 4px rgba(0,0,0,0.3)", padding: 4,
          }}>
            <div style={{ color: CP_GREEN, padding: "2px 4px 6px" }}>Open with</div>
            {PROGRAMS.map((p) => (
              <div key={p.name} className="cp-tile"
                onClick={() => { setAssoc({ ...assoc, [sel]: p.name }); setChoosing(false); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 4px" }}>
                <ProgIcon name={p.name} size={16} /> {p.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 120, overflow: "auto", border: "1px solid #828790" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: FONT, fontSize: 12, tableLayout: "fixed" }}>
          <thead>
            <tr style={{ background: "linear-gradient(180deg,#fff 0%,#f1f2f4 100%)", textAlign: "left" }}>
              {["Name", "Description", "Current Default"].map((h, i) => (
                <th key={h} style={{ ...cell, fontWeight: 400, borderRight: "1px solid #e3e3e3", borderBottom: "1px solid #d5d5d5", width: i === 0 ? 70 : undefined }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TYPES.map((t) => (
              <tr key={t.ext} onClick={() => setSel(t.ext)} style={{
                background: t.ext === sel ? "#3399ff" : "transparent", color: t.ext === sel ? "#fff" : "#000", cursor: "default",
              }}>
                <td style={cell}>{t.ext}</td>
                <td style={cell}>{t.desc}</td>
                <td style={cell}>{assoc[t.ext]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer><button onClick={done}>Close</button></Footer>
    </>
  );
}

function AutoPlayView({ done }: { done: () => void }) {
  const narrow = useNarrow();
  const fresh = () => Object.fromEntries(MEDIA.map((m) => [m, AUTOPLAY_ACTIONS[0]]));
  const [enabled, setEnabled] = useState(true);
  const [choices, setChoices] = useState<Record<string, string>>(fresh);

  return (
    <>
      <Heading>Choose what happens when you insert each type of media or device</Heading>
      <div style={{ marginBottom: 10 }}>
        <input type="checkbox" id="cp-autoplay" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <label htmlFor="cp-autoplay">Use AutoPlay for all media and devices</label>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, overflowY: "auto" }}>
        <div style={{ color: CP_GREEN }}>Media</div>
        {MEDIA.map((m) => (
          <div key={m} style={{ display: "flex", alignItems: narrow ? "flex-start" : "center", flexDirection: narrow ? "column" : "row", gap: narrow ? 3 : 10, opacity: enabled ? 1 : 0.55 }}>
            <span style={{ width: narrow ? undefined : 170, flexShrink: 0 }}>{m}</span>
            <select disabled={!enabled} value={choices[m]} onChange={(e) => setChoices({ ...choices, [m]: e.target.value })}
              style={{ width: 300, maxWidth: "100%" }}>
              {AUTOPLAY_ACTIONS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}><button onClick={() => setChoices(fresh())}>Reset all defaults</button></div>
      <Footer>
        <button onClick={done}>Save</button>
        <button onClick={done}>Cancel</button>
      </Footer>
    </>
  );
}

function AccessView({ done }: { done: () => void }) {
  const configs = [
    { name: "Computer Manufacturer", detail: "Animesh's PC ships with its own browser, notepad and media player set as defaults." },
    { name: "Microsoft Windows", detail: "Internet Explorer, Windows Media Player and Windows Live Messenger are the defaults." },
    { name: "Non-Microsoft", detail: "No Non-Microsoft programs are available for this configuration." },
    { name: "Custom", detail: "Choose a default web browser, e-mail program, media player and instant messaging program." },
  ];
  const [sel, setSel] = useState("Computer Manufacturer");
  const [expanded, setExpanded] = useState<string | null>("Computer Manufacturer");

  return (
    <>
      <Heading>Set Program Access and Computer Defaults</Heading>
      <div style={{ color: "#333", marginBottom: 10 }}>
        A program configuration specifies default programs for certain activities, such as Web browsing or sending e-mail, and which programs are accessible from the Start menu, desktop, and other locations.
      </div>
      <div style={{ color: "#333", marginBottom: 8 }}>Choose a configuration:</div>
      <div style={{ border: "1px solid #ccd5e0", padding: 4, overflowY: "auto" }}>
        {configs.map((c) => (
          <div key={c.name} style={{ borderBottom: "1px solid #eef1f5", padding: "4px 2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="radio" name="cp-access" id={`cp-access-${c.name}`} checked={sel === c.name} onChange={() => setSel(c.name)} />
              <label htmlFor={`cp-access-${c.name}`} style={{ flex: 1 }}>{c.name}</label>
              <button aria-label="Expand" onClick={() => setExpanded(expanded === c.name ? null : c.name)}
                style={{ minWidth: 0, width: 22, height: 20, padding: 0 }}>
                {expanded === c.name ? "▴" : "▾"}
              </button>
            </div>
            {expanded === c.name && <div style={{ padding: "4px 0 2px 26px", color: "#555" }}>{c.detail}</div>}
          </div>
        ))}
      </div>
      <Footer>
        <button onClick={done}>OK</button>
        <button onClick={done}>Cancel</button>
      </Footer>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type View = "home" | "defaults" | "associate" | "autoplay" | "access";
const TITLES: Record<View, string> = {
  home: "", defaults: "Set Default Programs", associate: "Set Associations",
  autoplay: "AutoPlay", access: "Set Program Access and Computer Defaults",
};

export default function DefaultPrograms({ app, ...props }: WindowProps) {
  const initial = (Object.keys(TITLES) as View[]).includes(app.url as View) ? (app.url as View) : "home";
  const nav = useNav<View>(initial);
  const open = useOpen();
  const [assoc, setAssoc] = useState(defaultsFor);
  const home = () => nav.go("home");

  const path = ["Control Panel", "Programs", "Default Programs"];
  if (nav.cur !== "home") path.push(TITLES[nav.cur]);

  const taskPane = nav.cur === "home" ? (
    <TaskPane seeAlso={[{ label: "AutoPlay", onClick: () => nav.go("autoplay") }]}>
      <Link className="cp-task" onClick={() => open("Control Panel")}>Control Panel Home</Link>
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
      onCrumb={(i) => (i <= 0 ? open("Control Panel") : i === 1 ? open("Control Panel#programs") : home())}
      taskPane={taskPane}
      width="720px"
      height="520px"
    >
      {nav.cur === "defaults" ? <DefaultsView assoc={assoc} setAssoc={setAssoc} done={home} onChoose={() => nav.go("associate")} />
        : nav.cur === "associate" ? <AssociateView assoc={assoc} setAssoc={setAssoc} done={home} />
        : nav.cur === "autoplay" ? <AutoPlayView done={home} />
        : nav.cur === "access" ? <AccessView done={home} />
        : <HomeView go={nav.go} />}
    </CPWindow>
  );
}
