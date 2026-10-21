"use client";
import React, { useRef, useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import type { WindowProps } from "../Desktop/windows";
import { APPS, iconPath } from "../Desktop/apps";
import { FONT, TitleBar, NavBtn, ExplorerBody, EXPLORER_CANCEL, Menu, StatusBar } from "./Chrome";
import { Link, useNav, useOpen, CP_BLUE } from "./ControlPanelShell";

// Windows Help and Support, answering questions about this site and Animesh.

const ICONS = {
  window: iconPath(APPS["Help and Support"]?.icon),
  home: "/icons/win7/help-home.svg",
  print: "/icons/win7/help-print.svg",
  browse: "/icons/win7/help-browse.svg",
  ask: "/icons/win7/help-ask.svg",
  tip: "/icons/win7/help.svg",
  topic: "/icons/win7/help.svg",
  resume: iconPath(APPS["My Resume"]?.icon),
  basics: iconPath(APPS["Computer"]?.icon),
  github: "/icons/github.png",
  linkedin: "/icons/linkedin.png",
};

type Helpers = { open: (to: string) => void; go: (id: string) => void };
type Topic = {
  id: string; title: string; group: "About Animesh" | "Windows Basics";
  summary: string; keywords: string; related: string[];
  body: (h: Helpers) => React.ReactNode;
};

const EMAIL = "hi@animesh.us";

function Steps({ title, steps }: { title: string; steps: React.ReactNode[] }) {
  return (
    <div style={{ margin: "14px 0" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 4, listStyle: "decimal" }}>
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "12px 0", padding: "8px 10px", background: "#f4f8fc", border: "1px solid #d6e3f1" }}>
      <img src={ICONS.tip} width={16} height={16} alt="" style={{ flexShrink: 0, marginTop: 1 }} />
      <div><b>Tip</b><br />{children}</div>
    </div>
  );
}

const TOPICS: Topic[] = [
  {
    id: "about", title: "Who is Animesh?", group: "About Animesh", related: ["resume", "projects", "contact"],
    keywords: "animesh chaudhri bio about software engineer bajaj finserv pune experience",
    summary: "Animesh Chaudhri is a software engineer in Pune, India, building workflows and GenAI pipelines.",
    body: ({ open }) => (
      <>
        <p>Animesh Chaudhri is a Software Engineer at Bajaj Finserv in Pune, India, where he builds durable Temporal workflows and GenAI content pipelines.</p>
        <p>Before that he was an Associate Software Engineer and intern at Bajaj Finserv Health, where he built an MCP server for log observability and won the Best Intern and Lord of the Logs awards. He contributed to Google Summer of Code 2024 and studied Computer Science at Chitkara University.</p>
        <p>He also builds things on the side, like Rustman (a native API client written in Rust), Syntropy Labs and DSA Atlas — and this Windows 7 desktop.</p>
        <p><Link onClick={() => open("My Resume")}>Open My Resume</Link> · <Link onClick={() => open("My Projects")}>See my projects</Link></p>
      </>
    ),
  },
  {
    id: "resume", title: "View Animesh's resume", group: "About Animesh", related: ["about", "contact"],
    keywords: "resume cv experience education skills awards pdf",
    summary: "Open the resume from the desktop or the Start menu.",
    body: ({ open }) => (
      <>
        <p>The resume covers Animesh&apos;s experience, skills, projects, publications and awards.</p>
        <Steps title="To view the resume" steps={[
          <>Double-click <b>My Resume</b> on the desktop (double-tap on a phone).</>,
          <>The resume opens in its own window. Use the scroll bar to read it.</>,
        ]} />
        <p><Link onClick={() => open("My Resume")}>Click to open My Resume</Link></p>
      </>
    ),
  },
  {
    id: "projects", title: "See Animesh's projects", group: "About Animesh", related: ["about", "blog"],
    keywords: "projects rustman syntropy dsa atlas github portfolio work code",
    summary: "Browse projects like Rustman, Syntropy Labs and DSA Atlas in the My Projects folder.",
    body: ({ open }) => (
      <>
        <p>The <b>My Projects</b> folder lists Animesh&apos;s projects with descriptions, technologies, and links to source code and live demos.</p>
        <Steps title="To browse the projects" steps={[
          <>Double-click <b>My Projects</b> on the desktop.</>,
          <>Click a project in the list to see its details.</>,
          <>Click <b>GitHub</b> or <b>Open Demo</b> to visit it.</>,
        ]} />
        <p><Link onClick={() => open("My Projects")}>Click to open My Projects</Link> · <Link onClick={() => open("Github")}>See everything on GitHub</Link></p>
      </>
    ),
  },
  {
    id: "blog", title: "Read the blog", group: "About Animesh", related: ["projects", "about"],
    keywords: "blog posts articles writing perlin noise hello world",
    summary: "Animesh writes about code, projects and random things he finds interesting.",
    body: ({ open }) => (
      <>
        <p>The blog has posts about how this desktop was built, procedural generation with Perlin noise, and more.</p>
        <Steps title="To read the blog" steps={[
          <>Double-click <b>My Blog</b> on the desktop.</>,
          <>Click a post title to read it. Use <b>back to blog</b> to return to the list.</>,
        ]} />
        <p><Link onClick={() => open("My Blog")}>Click to open My Blog</Link></p>
      </>
    ),
  },
  {
    id: "contact", title: "Contact Animesh", group: "About Animesh", related: ["about", "resume"],
    keywords: "contact email mail message hire reach linkedin github chat ask",
    summary: `Email ${EMAIL}, send a message, or find Animesh on GitHub and LinkedIn.`,
    body: ({ open }) => (
      <>
        <p>There are several ways to get in touch:</p>
        <ul style={{ margin: "0 0 10px", paddingLeft: 22, listStyle: "disc", display: "flex", flexDirection: "column", gap: 5 }}>
          <li>Email: <a className="cp-link" href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
          <li>Send a message with <Link onClick={() => open("Chat")}>Windows Live Messenger</Link></li>
          <li>GitHub: <Link onClick={() => open("Github")}>github.com/animeshchaudhri</Link></li>
          <li>LinkedIn: <Link onClick={() => open("LinkedIn")}>linkedin.com/in/animeshchaudhri</Link></li>
        </ul>
      </>
    ),
  },
  {
    id: "desktop", title: "Use the desktop and its icons", group: "Windows Basics", related: ["start", "personalize", "mobile"],
    keywords: "desktop icons double click open move drag right click view sort arrange",
    summary: "Open programs from desktop icons, move them around, and change how they're arranged.",
    body: ({ open }) => (
      <>
        <p>Icons on the desktop open programs, folders and pages.</p>
        <Steps title="To open an item" steps={[<>Double-click its icon. On a touch screen, double-tap it.</>]} />
        <Steps title="To change how icons are arranged" steps={[
          <>Right-click an empty part of the desktop.</>,
          <>Point to <b>View</b> to change icon size, or <b>Sort by</b> to reorder them.</>,
        ]} />
        <p><Link onClick={() => open("Personalization")}>Change desktop background and colors</Link></p>
      </>
    ),
  },
  {
    id: "start", title: "Use the Start menu and taskbar", group: "Windows Basics", related: ["desktop", "mobile"],
    keywords: "start menu taskbar programs search all programs minimize switch windows shut down",
    summary: "Find programs from the Start menu and switch between open windows on the taskbar.",
    body: () => (
      <>
        <Steps title="To open a program from the Start menu" steps={[
          <>Click the <b>Start</b> button in the lower-left corner of the screen.</>,
          <>Click a program, or click <b>All Programs</b> to see the full list.</>,
          <>You can also type a program&apos;s name in the search box.</>,
        ]} />
        <Steps title="To switch between windows" steps={[
          <>Click a window&apos;s button on the taskbar to bring it to the front.</>,
          <>Click the minimize button on a window to hide it; click its taskbar button to show it again.</>,
        ]} />
      </>
    ),
  },
  {
    id: "mobile", title: "Use Animesh's PC on a phone or tablet", group: "Windows Basics", related: ["desktop", "start"],
    keywords: "phone mobile tablet touch tap ease of access accessibility small screen",
    summary: "Double-tap icons; windows open full screen and close with the X button.",
    body: () => (
      <>
        <p>On small screens every window opens full screen so it&apos;s easy to read.</p>
        <Steps title="To use the desktop with touch" steps={[
          <>Double-tap an icon to open it.</>,
          <>Tap the <b>X</b> in the top-right corner of a window to close it, or the minimize button to send it to the taskbar.</>,
          <>Tap a button on the taskbar to bring its window back.</>,
        ]} />
        <Tip>Turn your phone sideways for more room.</Tip>
      </>
    ),
  },
  {
    id: "personalize", title: "Change the desktop background and window color", group: "Windows Basics", related: ["desktop", "display"],
    keywords: "personalize theme background wallpaper window color transparency appearance",
    summary: "Pick a theme, a desktop picture or a solid color, and change the color of window borders.",
    body: ({ open }) => (
      <>
        <Steps title="To change the desktop background" steps={[
          <>Right-click the desktop and click <b>Personalize</b>, or open Control Panel and click <b>Change desktop background</b>.</>,
          <>Click <b>Desktop Background</b>, choose a picture or solid color, and click <b>Save changes</b>.</>,
        ]} />
        <Steps title="To change window colors" steps={[
          <>In Personalization, click <b>Window Color</b>.</>,
          <>Click a color, or use <b>Show color mixer</b> to make your own, then click <b>Save changes</b>.</>,
        ]} />
        <p><Link onClick={() => open("Personalization")}>Click to open Personalization</Link></p>
      </>
    ),
  },
  {
    id: "display", title: "What display settings should I choose?", group: "Windows Basics", related: ["personalize", "mobile"],
    keywords: "display screen resolution text size larger smaller zoom monitor",
    summary: "Use the recommended resolution; make text bigger with your browser's zoom.",
    body: ({ open }) => (
      <>
        <p>The recommended resolution is your screen&apos;s native resolution, which gives the sharpest picture.</p>
        <Steps title="To make text and other items larger or smaller" steps={[
          <>Press <b>Ctrl</b> and <b>+</b> to zoom in, or <b>Ctrl</b> and <b>−</b> to zoom out (<b>⌘</b> on a Mac).</>,
          <>Press <b>Ctrl</b> and <b>0</b> to go back to the normal size.</>,
        ]} />
        <p><Link onClick={() => open("Screen Resolution")}>Click to open Screen Resolution</Link></p>
      </>
    ),
  },
  {
    id: "troubleshoot", title: "Fix problems with how the desktop looks", group: "Windows Basics", related: ["personalize", "display"],
    keywords: "troubleshoot fix problem broken reset restore default wallpaper color settings",
    summary: "Restore the default background, colors and desktop layout.",
    body: () => (
      <>
        <p>If the desktop looks wrong after changing settings, you can restore everything to how it was the first time you visited.</p>
        <p>
          <button onClick={() => { localStorage.clear(); location.reload(); }}>Restore default settings</button>
        </p>
        <Tip>This only resets settings saved by this site in your browser.</Tip>
      </>
    ),
  },
];

const topic = (id: string) => TOPICS.find((t) => t.id === id);

function search(q: string) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return TOPICS
    .map((t) => {
      const hay = `${t.title} ${t.keywords} ${t.summary}`.toLowerCase();
      return { t, score: words.reduce((s, w) => s + (t.title.toLowerCase().includes(w) ? 3 : hay.includes(w) ? 1 : 0), 0) };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.t);
}

function Tool({ icon, label, onClick, arrow }: { icon?: keyof typeof ICONS; label?: string; onClick: () => void; arrow?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <div
      className="help-tool"
      title={label}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        height: 28, display: "flex", alignItems: "center", gap: 4, padding: label && !icon ? "0 8px" : "0 4px",
        borderRadius: 3, cursor: "default", fontFamily: FONT, fontSize: 12, color: "#000", flexShrink: 0,
        border: h ? "1px solid rgba(40,70,110,0.55)" : "1px solid transparent",
        background: h ? "linear-gradient(180deg,rgba(255,255,255,0.75) 0%,rgba(225,238,252,0.6) 50%,rgba(190,215,245,0.6) 51%,rgba(220,235,252,0.7) 100%)" : "transparent",
      }}
    >
      {icon && <img src={ICONS[icon]} width={22} height={22} alt="" />}
      {label && (!icon || icon === "ask") && <span>{label}</span>}
      {arrow && <span style={{ fontSize: 8, opacity: 0.7 }}>▼</span>}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function Article({ t, h, textSize }: { t: Topic; h: Helpers; textSize: number }) {
  const [helpful, setHelpful] = useState<string | null>(null);
  return (
    <div className="help-article" style={{ fontSize: textSize, lineHeight: 1.5 }}>
      <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: CP_BLUE, margin: "0 0 10px" }}>{t.title}</h1>
      {t.body(h)}
      {t.related.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ color: CP_BLUE, fontSize: 14, marginBottom: 4 }}>See also</div>
          {t.related.map((id) => <div key={id}><Link onClick={() => h.go(id)}>{topic(id)?.title}</Link></div>)}
        </div>
      )}
      <div className="help-noprint" style={{ marginTop: 20, padding: "8px 10px", border: "1px solid #d6e3f1", background: "#f7fafd" }}>
        {helpful ? (
          <span>Thanks for your feedback.</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span>Was this helpful?</span>
            {["Yes", "No", "Somewhat"].map((v) => (
              <span key={v} style={{ display: "flex", alignItems: "center" }}>
                <input type="radio" name={`help-${t.id}`} id={`help-${t.id}-${v}`} onChange={() => setHelpful(v)} />
                <label htmlFor={`help-${t.id}-${v}`}>{v}</label>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HomePage({ h }: { h: Helpers }) {
  const row = (icon: React.ReactNode, label: string, onClick: () => void) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{icon}<Link onClick={onClick}>{label}</Link></div>
  );
  return (
    <>
      <div style={{
        margin: "-14px -18px 16px", padding: "20px 22px 22px",
        background: "linear-gradient(180deg,#d3e8fa 0%,#ecf5fd 60%,#ffffff 100%)",
        borderBottom: "1px solid #dbe7f3",
      }}>
        <div style={{ fontSize: 22, color: CP_BLUE, marginBottom: 6 }}>Find an answer quickly</div>
        <div style={{ color: "#333" }}>Enter a few words in the search box above.</div>
      </div>
      <div style={{ fontSize: 15, color: CP_BLUE, marginBottom: 10 }}>Not sure where to start?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, paddingLeft: 4 }}>
        {row(<img src={ICONS.resume} width={20} height={20} alt="" />, "Get to know Animesh", () => h.go("about"))}
        {row(<img src={ICONS.basics} width={20} height={20} alt="" />, "Learn about Windows Basics", () => h.go("browse"))}
        {row(<img src={ICONS.browse} width={20} height={20} alt="" />, "Browse Help topics", () => h.go("browse"))}
      </div>
      <div style={{ fontSize: 15, color: CP_BLUE, margin: "22px 0 10px" }}>More on the web</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, paddingLeft: 4 }}>
        {row(<img src={ICONS.github} width={20} height={20} alt="" />, "Find Animesh on GitHub", () => h.open("Github"))}
        {row(<img src={ICONS.linkedin} width={20} height={20} alt="" />, "Connect on LinkedIn", () => h.open("LinkedIn"))}
      </div>
    </>
  );
}

function BrowsePage({ h }: { h: Helpers }) {
  return (
    <>
      <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: CP_BLUE, margin: "0 0 12px" }}>Contents</h1>
      {(["About Animesh", "Windows Basics"] as const).map((g) => (
        <div key={g} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, marginBottom: 6 }}>
            <img src={ICONS.browse} width={18} height={18} alt="" />{g}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingLeft: 26 }}>
            {TOPICS.filter((t) => t.group === g).map((t) => (
              <div key={t.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <img src={ICONS.topic} width={16} height={16} alt="" />
                <Link onClick={() => h.go(t.id)}>{t.title}</Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function SearchPage({ q, h }: { q: string; h: Helpers }) {
  const results = search(q);
  return (
    <>
      <div style={{ fontSize: 15, color: CP_BLUE, marginBottom: 12 }}>
        {results.length ? `Best ${results.length} result${results.length > 1 ? "s" : ""} for "${q}"` : `No results for "${q}"`}
      </div>
      {results.length === 0 && (
        <div style={{ color: "#333" }}>
          Try fewer or different words, or <Link onClick={() => h.go("browse")}>browse Help topics</Link>.
        </div>
      )}
      <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10, listStyle: "decimal" }}>
        {results.map((t) => (
          <li key={t.id}>
            <Link onClick={() => h.go(t.id)}>{t.title}</Link>
            <div style={{ color: "#444" }}>{t.summary}</div>
          </li>
        ))}
      </ol>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function HelpSupport({ app, onClose, zIndex, onFocus, minimized, onMinimize }: WindowProps) {
  const open = useOpen();
  const initial = app.url && (topic(app.url) || app.url.startsWith("search:")) ? app.url : "home";
  const nav = useNav<string>(initial);
  const [q, setQ] = useState(initial.startsWith("search:") ? initial.slice(7) : "");
  const [menu, setMenu] = useState<null | "options" | "online">(null);
  const [textSize, setTextSize] = useState(12);
  const [online, setOnline] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const go = (id: string) => { nav.go(id); contentRef.current?.scrollTo(0, 0); };
  const h: Helpers = { open, go };
  const runSearch = () => q.trim() && go(`search:${q.trim()}`);

  const print = () => {
    const html = contentRef.current?.innerHTML ?? "";
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0";
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(`<html><head><title>Windows Help and Support</title><style>body{font:12px "Segoe UI",sans-serif;padding:20px}.help-noprint,button{display:none}a,[role=link]{color:#0066cc}</style></head><body>${html}</body></html>`);
    doc.close();
    frame.contentWindow!.focus();
    frame.contentWindow!.print();
    setTimeout(() => frame.remove(), 1000);
  };

  const cur = nav.cur;
  const t = topic(cur);

  return (
    <DraggableWindow
      cancelSelector={`${EXPLORER_CANCEL}, .help-tool, .help-search`}
      zIndex={zIndex}
      width="700px"
      height="560px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <TitleBar title={app.title} icon={ICONS.window} onClose={onClose} />

      {/* toolbar on the glass */}
      <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 6px 5px 5px", flexShrink: 0, minWidth: 0 }}>
        <NavBtn dir="back" disabled={!nav.back} onClick={nav.back} />
        <div style={{ width: 2 }} />
        <NavBtn dir="fwd" disabled={!nav.fwd} onClick={nav.fwd} />
        <div className="help-search" style={{
          flex: 1, minWidth: 90, maxWidth: 320, height: 24, marginLeft: 8, display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.92)", border: "1px solid rgba(40,60,90,0.55)", borderRadius: 2,
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.45)",
        }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search Help"
            style={{ all: "unset", flex: 1, minWidth: 0, padding: "0 6px", fontFamily: FONT, fontSize: 12, fontStyle: q ? "normal" : "italic" }}
          />
          <div onClick={runSearch} style={{
            width: 26, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            background: "linear-gradient(180deg,#6fb5f2 0%,#2f7fd1 50%,#1a62b4 51%,#3b8ee0 100%)", borderLeft: "1px solid #1f5591",
          }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="#fff" strokeWidth="1.4" />
              <line x1="7.8" y1="7.8" x2="11" y2="11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <Tool icon="home" label="Help and Support home" onClick={() => go("home")} />
        <Tool icon="print" label="Print" onClick={print} />
        <Tool icon="browse" label="Browse Help" onClick={() => go("browse")} />
        <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.25)", boxShadow: "1px 0 rgba(255,255,255,0.5)", margin: "0 3px" }} />
        <Tool icon="ask" label="Ask" onClick={() => go("contact")} />
        <div style={{ position: "relative" }}>
          <Tool label="Options" arrow onClick={() => setMenu(menu === "options" ? null : "options")} />
          {menu === "options" && (
            <Menu onClose={() => setMenu(null)} style={{ right: 0, top: 30, minWidth: 170 }} items={[
              { label: "Print...", onClick: print },
              { label: "Browse Help", onClick: () => go("browse"), divider: true },
              { label: "Larger text", radio: textSize === 14, onClick: () => setTextSize(14) },
              { label: "Medium text", radio: textSize === 12, onClick: () => setTextSize(12) },
              { label: "Smaller text", radio: textSize === 11, onClick: () => setTextSize(11) },
            ]} />
          )}
        </div>
      </div>

      <ExplorerBody>
        <div ref={contentRef} style={{
          flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 18px 18px",
          fontFamily: FONT, fontSize: 12, color: "#1a1a1a",
        }}>
          {t ? <Article key={t.id} t={t} h={h} textSize={textSize} />
            : cur === "browse" ? <BrowsePage h={h} />
            : cur.startsWith("search:") ? <SearchPage q={cur.slice(7)} h={h} />
            : <HomePage h={h} />}
        </div>
        <div style={{ position: "relative" }}>
          <StatusBar
            left={<span className="help-tool" style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer" }} onClick={() => go("contact")}>
              <img src={ICONS.ask} width={16} height={16} alt="" />
              More support options
            </span>}
            right={<span className="help-tool" style={{ cursor: "pointer" }} onClick={() => setMenu(menu === "online" ? null : "online")}>
              {online ? "Online Help" : "Offline Help"} ▾
            </span>}
          />
          {menu === "online" && (
            <Menu onClose={() => setMenu(null)} style={{ right: 6, bottom: 24, minWidth: 160 }} items={[
              { label: "Get online Help", radio: online, onClick: () => setOnline(true) },
              { label: "Get offline Help", radio: !online, onClick: () => setOnline(false) },
            ]} />
          )}
        </div>
      </ExplorerBody>
    </DraggableWindow>
  );
}
