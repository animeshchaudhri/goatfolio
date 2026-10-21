"use client";
import React, { useMemo, useRef, useState } from "react";
import { useDesktop } from "../Desktop/DesktopContext";
import { APPS, iconPath } from "../Desktop/apps";
import { useWindowSize } from "../../hooks/useWindowSize";
import {
  FONT, TitleBar, AddressBar, CommandBar, NavPane, SectionHeader, StatusBar, ExplorerBody, Menu, itemStyle,
  type Command, type MenuItem, type ViewMode,
} from "../Win7/Chrome";

interface ProjectLink {
  label: string;
  url: string;
  /** Site allows iframing, so it opens in a desktop browser window instead of a new tab */
  embed?: boolean;
}

interface Project {
  id: string;
  title: string;
  kind: string;
  description: string;
  techStack: string[];
  links: ProjectLink[];
}

const projects: Project[] = [
  {
    id: "rustman",
    title: "Rustman",
    kind: "Desktop application",
    description: "Free, open-source Postman alternative built in Rust with a fully native iced GUI: no webview, no Electron, ~30 MB install, no account and zero telemetry. Native reqwest HTTP engine, WebSocket mode, multipart uploads, Bearer/Basic/API Key/Cookie/JWT auth, rustman-engine (a scripting language written from scratch for pre-request and test scripts) and built-in git for collections.",
    techStack: ["Rust", "iced", "reqwest", "SQLite", "Git"],
    links: [
      { label: "Website", url: "https://rust-man-org.github.io/rustman/", embed: true },
      { label: "GitHub", url: "https://github.com/rust-man-org/rustman" },
    ],
  },
  {
    id: "syntropy-labs",
    title: "Syntropy Labs",
    kind: "Web application",
    description: "LLM evaluation and benchmarking platform. Multi-service architecture (Orchestrator, Model Runner, Eval Engine, Realtime Service) that evaluates LLM output across OpenAI, Anthropic, Gemini, Mistral and Azure with unified token tracking, LLM-as-judge scoring (relevance, coherence, fluency) and progressive batch evaluation with per-row score persistence to GCS.",
    techStack: ["Python", "FastAPI", "LiteLLM", "MongoDB", "Docker", "WebSockets"],
    links: [{ label: "Live", url: "https://syntropylabs.ai/", embed: true }],
  },
  {
    id: "dsa-atlas",
    title: "DSA Atlas",
    kind: "Web application",
    description: "Company-specific DSA interview-prep platform with authentication, problem tracking and an interactive UI.",
    techStack: ["Next.js", "Express.js", "Node.js", "MongoDB", "Clerk.js", "Framer Motion"],
    links: [
      { label: "Live", url: "https://dsaatlas.vercel.app/", embed: true },
      { label: "GitHub", url: "https://github.com/animeshchaudhri/dsaatlas" },
    ],
  },
  {
    id: "good-morning",
    title: "Good Morning Image Cleaner",
    kind: "Android application",
    description: "Android app that uses hash-based deduplication to detect and remove redundant “Good Morning” images from WhatsApp media, significantly reducing storage clutter for senior users.",
    techStack: ["Android", "Java/Kotlin", "Background Services", "File I/O"],
    links: [{ label: "Play Store", url: "https://play.google.com/store/apps/details?id=com.animesh.goodmorning" }],
  },
  {
    id: "purble-place",
    title: "Purble Place Reimagined",
    kind: "Game",
    description: "Reverse-engineered the classic Windows game for the web, rebuilding sprite assets with Resource Hacker and Texture Packer Pro.",
    techStack: ["React.js", "PixiJS", "JavaScript"],
    links: [{ label: "GitHub", url: "https://github.com/animeshchaudhri/purble" }],
  },
  {
    id: "http-server",
    title: "HTTP Server in C++",
    kind: "Network server",
    description: "High-performance, multi-threaded HTTP/1.1 server supporting concurrent GET/POST requests with robust error handling.",
    techStack: ["C++", "Multithreading", "Network Programming", "HTTP"],
    links: [{ label: "GitHub", url: "https://github.com/animeshchaudhri/http-server-cpp" }],
  },
  {
    id: "gsoc-2024",
    title: "Google Summer of Code 2024",
    kind: "Open source contribution",
    description: "Built a cross-platform desktop app frontend with React and Tailwind CSS inside a Tauri shell, filesystem-level backend logic in Rust, automation daemons and shell scripts, and AI-powered object, face and scene tagging with Python, OpenVINO and YOLO.",
    techStack: ["React", "Tailwind CSS", "Tauri", "Rust", "Python", "OpenVINO", "YOLO"],
    links: [{ label: "Final report", url: "https://gist.github.com/animeshchaudhri/b9c95fb87743498b5a441fa48f59c730" }],
  },
  {
    id: "hot-or-not",
    title: "Hot or Not University Edition",
    kind: "Web application",
    description: "Web app for rating and comparing people from your university: compare two people, vote, view leaderboards and skip comparisons.",
    techStack: ["Next.js", "NestJS", "MongoDB", "Shadcn UI", "TypeScript"],
    links: [
      { label: "Live", url: "https://hot-or-not-three.vercel.app/", embed: true },
      { label: "GitHub", url: "https://github.com/animeshchaudhri/hot-or-not" },
    ],
  },
];

// Every icon this window uses (stand-ins until the real Win7 icons are extracted)
const ICONS = {
  /** Project items, title bar, address bar and details pane */
  folder: "win7:folder",
  /** APPS icon name for project sites opened in a desktop browser window */
  browser: "win7:iexplore",
};
const DOUBLE_TAP_MS = 450;

type Arrange = "Folder" | "Name" | "Type";
type Panes = { details: boolean; navigation: boolean; library: boolean };

const primaryLink = (p: Project) => p.links.find((l) => l.embed) ?? p.links[0];
const plural = (n: number) => `${n} item${n === 1 ? "" : "s"}`;


// ─── Win7 hyperlink ───────────────────────────────────────────────────────────
function Win7Link({ link, onOpen }: { link: ProjectLink; onOpen: (l: ProjectLink) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => { e.preventDefault(); onOpen(link); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        color: hov ? "#3399FF" : "#0066CC",
        textDecoration: hov ? "underline" : "none",
        cursor: "pointer",
      }}
    >
      {link.label}
    </a>
  );
}

// ─── One project in the current view ──────────────────────────────────────────
const ellipsis: React.CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

function ProjectItem({ project, view, selected, compact, onClick }: {
  project: Project; view: ViewMode; selected: boolean; compact: boolean; onClick: (e: React.MouseEvent) => void;
}) {
  const [hov, setHov] = useState(false);
  const state: React.CSSProperties = {
    ...itemStyle(selected, hov),
    borderRadius: 3,
    boxShadow: selected || hov ? "inset 0 0 0 1px rgba(255,255,255,0.55)" : "none",
    cursor: "default", userSelect: "none", minWidth: 0,
    fontFamily: FONT, fontSize: 12, color: "#1E1E1E",
  };
  const handlers = { onClick, onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) };

  if (view === "large" || view === "medium") {
    const size = view === "large" ? 96 : 48;
    return (
      <div {...handlers} style={{ ...state, display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 3px 5px" }}>
        <img src={iconPath(ICONS.folder, size)} width={size} height={size} alt="" />
        <div style={{
          marginTop: 2, textAlign: "center", lineHeight: "15px", wordBreak: "break-word",
          display: "-webkit-box", WebkitLineClamp: selected ? 4 : 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{project.title}</div>
      </div>
    );
  }

  if (view === "small" || view === "list") {
    return (
      <div {...handlers} style={{ ...state, display: "flex", alignItems: "center", gap: 4, height: 22, padding: "0 4px" }}>
        <img src={iconPath(ICONS.folder, 16)} width={16} height={16} alt="" style={{ flexShrink: 0 }} />
        <span style={ellipsis}>{project.title}</span>
      </div>
    );
  }

  if (view === "details") {
    return (
      <div {...handlers} style={{
        ...state, display: "grid", alignItems: "center", height: 22,
        gridTemplateColumns: compact ? "minmax(0,1fr) 128px" : "minmax(0,1.3fr) 150px minmax(0,1.4fr)",
        padding: "0 4px",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
          <img src={iconPath(ICONS.folder, 16)} width={16} height={16} alt="" style={{ flexShrink: 0 }} />
          <span style={ellipsis}>{project.title}</span>
        </span>
        <span style={{ ...ellipsis, color: "#6D6D6D", paddingLeft: 6 }}>{project.kind}</span>
        {!compact && <span style={{ ...ellipsis, color: "#6D6D6D", paddingLeft: 6 }}>{project.techStack.join(", ")}</span>}
      </div>
    );
  }

  // tiles
  return (
    <div {...handlers} style={{ ...state, display: "flex", alignItems: "center", gap: 7, padding: "3px 6px 3px 4px" }}>
      <img src={iconPath(ICONS.folder, 48)} width={48} height={48} alt="" style={{ flexShrink: 0 }} />
      <div style={{ minWidth: 0, lineHeight: "15px" }}>
        <div style={ellipsis}>{project.title}</div>
        <div style={{ ...ellipsis, color: "#6D6D6D" }}>{project.kind}</div>
        <div style={{ ...ellipsis, color: "#6D6D6D" }}>{project.techStack.slice(0, 3).join(", ")}</div>
      </div>
    </div>
  );
}

const GRID: Record<ViewMode, string> = {
  large: "repeat(auto-fill, 112px)",
  medium: "repeat(auto-fill, 88px)",
  small: "repeat(auto-fill, minmax(210px, 1fr))",
  list: "repeat(auto-fill, minmax(210px, 1fr))",
  details: "1fr",
  tiles: "repeat(auto-fill, minmax(236px, 1fr))",
};

// Win7 details-view column header
function ColumnHeader({ compact }: { compact: boolean }) {
  const cols = compact ? ["Name", "Type"] : ["Name", "Type", "Technologies"];
  return (
    <div style={{
      display: "grid", position: "sticky", top: 0, zIndex: 1,
      gridTemplateColumns: compact ? "minmax(0,1fr) 128px" : "minmax(0,1.3fr) 150px minmax(0,1.4fr)",
      height: 25, margin: "-4px -6px 2px", padding: "0 10px",
      background: "linear-gradient(180deg,#ffffff 0%,#ffffff 40%,#f3f5f8 100%)",
      borderBottom: "1px solid #d5d5d5",
      fontFamily: FONT, fontSize: 12, color: "#4C607A", userSelect: "none",
    }}>
      {cols.map((c, i) => (
        <span key={c} style={{
          display: "flex", alignItems: "center", paddingLeft: i === 0 ? 20 : 6,
          borderRight: "1px solid #e5e5e5",
        }}>{c}</span>
      ))}
    </div>
  );
}

// ─── Details pane ─────────────────────────────────────────────────────────────
function ProjectDetails({ project, count, compact, onOpenLink }: {
  project: Project | null; count: number; compact: boolean; onOpenLink: (l: ProjectLink) => void;
}) {
  const label: React.CSSProperties = { color: "#5A677C", textAlign: "right", whiteSpace: "nowrap" };
  return (
    <div className="win7-details-pane" style={{
      flexShrink: 0,
      height: compact ? undefined : 112,
      maxHeight: compact ? "40%" : undefined,
      overflowY: "auto",
      display: "flex", alignItems: project ? "flex-start" : "center", gap: 12,
      padding: "7px 14px",
      background: "linear-gradient(180deg,#f8fafd 0%,#eef3fa 100%)",
      borderTop: "1px solid #c5d3e6",
      fontFamily: FONT, fontSize: 12, color: "#1A1A1A",
    }}>
      <img src={iconPath(ICONS.folder, 48)} width={48} height={48} alt="" style={{ flexShrink: 0 }} />
      {project ? (
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", columnGap: 24, rowGap: 6 }}>
          <div style={{ width: compact ? "100%" : 150, flexShrink: 0 }}>
            <div style={{ fontSize: 12.5 }}>{project.title}</div>
            <div style={{ color: "#5A677C" }}>{project.kind}</div>
          </div>
          <div style={{
            flex: 1, minWidth: 0,
            display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 6, rowGap: 1,
            lineHeight: "16px",
          }}>
            <span style={label}>Links:</span>
            <span style={{ display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
              {project.links.map((l) => <Win7Link key={l.url} link={l} onOpen={onOpenLink} />)}
            </span>
            <span style={label}>Technologies:</span>
            <span>{project.techStack.join(", ")}</span>
            <span style={label}>Description:</span>
            <span>{project.description}</span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12.5 }}>{plural(count)}</div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Portfolio({ title, onClose }: { title: string; onClose: () => void }) {
  const { openApp } = useDesktop();
  const isSmallScreen = useWindowSize();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("tiles");
  const [arrange, setArrange] = useState<Arrange>("Folder");
  const [arrangeOpen, setArrangeOpen] = useState(false);
  const [panes, setPanes] = useState<Panes>({ details: true, navigation: true, library: true });
  const [navSel, setNavSel] = useState("Libraries");
  const lastTap = useRef<{ id: string; time: number } | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.title, p.kind, p.description, ...p.techStack].some((s) => s.toLowerCase().includes(q))
    );
  }, [search]);

  const groups = useMemo(() => {
    if (arrange === "Folder") return [{ label: "", items: visible }];
    const byName = [...visible].sort((a, b) => a.title.localeCompare(b.title));
    if (arrange === "Name") return [{ label: "", items: byName }];
    const kinds = Array.from(new Set(byName.map((p) => p.kind))).sort();
    return kinds.map((k) => ({ label: k, items: byName.filter((p) => p.kind === k) }));
  }, [visible, arrange]);

  const selected = visible.find((p) => p.id === selectedId) ?? null;

  const openLink = (link: ProjectLink, project: Project) => {
    if (link.embed) openApp({ title: project.title, url: link.url, type: "browser", icon: ICONS.browser });
    else window.open(link.url, "_blank", "noopener,noreferrer");
  };
  const openProject = (p: Project) => openLink(primaryLink(p), p);

  const onItemClick = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation();
    const now = Date.now();
    // Timed taps instead of onDoubleClick so double-tap works on touch screens too
    if (lastTap.current?.id === p.id && now - lastTap.current.time < DOUBLE_TAP_MS) {
      lastTap.current = null;
      openProject(p);
      return;
    }
    lastTap.current = { id: p.id, time: now };
    setSelectedId(p.id);
  };

  const togglePane = (pane: keyof Panes) => setPanes((s) => ({ ...s, [pane]: !s[pane] }));

  const organize: MenuItem[] = [
    { label: "Cut", disabled: true },
    { label: "Copy", disabled: !selected, onClick: () => selected && navigator.clipboard?.writeText(primaryLink(selected).url) },
    { label: "Paste", disabled: true, divider: true },
    { label: "Undo", disabled: true },
    { label: "Redo", disabled: true, divider: true },
    { label: "Select all", disabled: true, divider: true },
    { label: "Details pane", checked: panes.details, onClick: () => togglePane("details") },
    { label: "Navigation pane", checked: panes.navigation && !isSmallScreen, disabled: isSmallScreen, onClick: () => togglePane("navigation") },
    { label: "Library pane", checked: panes.library, onClick: () => togglePane("library"), divider: true },
    { label: "Properties", disabled: true, divider: true },
    { label: "Close", onClick: onClose },
  ];

  const source = selected?.links.find((l) => l.label === "GitHub");
  const commands: Command[] = [
    { label: "Organize", menu: organize },
    ...(selected
      ? [
          { label: "Open", onClick: () => openProject(selected) },
          ...(source && source !== primaryLink(selected)
            ? [{ label: "View source", onClick: () => openLink(source, selected) }]
            : []),
          {
            label: "E-mail",
            onClick: () => {
              window.location.href = `mailto:?subject=${encodeURIComponent(selected.title)}&body=${encodeURIComponent(primaryLink(selected).url)}`;
            },
          },
        ]
      : []),
  ];

  // React and Menu's outside-click listener both live on `document`, so only stopImmediatePropagation
  // keeps Menu from closing itself right before this toggle's click reopens it
  const keepMenu = (e: React.SyntheticEvent) => e.nativeEvent.stopImmediatePropagation();

  return (
    <>
      <TitleBar title={title} icon={ICONS.folder} onClose={onClose} />
      <AddressBar
        icon={ICONS.folder}
        path={search ? ["Libraries", "Search Results in My Projects"] : ["Libraries", "My Projects"]}
        searchPlaceholder="Search My Projects"
        search={search}
        onSearch={setSearch}
        onCrumb={search ? () => setSearch("") : undefined}
        onRefresh={() => { setSelectedId(null); setSearch(""); }}
      />

      <ExplorerBody>
        <CommandBar commands={commands} view={view} onViewChange={setView} />

        <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
          {panes.navigation && !isSmallScreen && (
            <NavPane
              navSel={navSel}
              onSelect={(label) => (APPS[label] ? openApp(label) : setNavSel(label))}
            />
          )}

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff" }}>
            {panes.library && (
              <div style={{
                position: "relative", zIndex: arrangeOpen ? 50 : undefined,
                display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                flexWrap: "wrap", gap: "2px 12px",
                padding: "8px 14px 7px 14px", flexShrink: 0,
                background: "linear-gradient(180deg,#FFFFFF 0%,#F1F5FB 100%)",
                borderBottom: "1px solid #E3EAF3",
                fontFamily: FONT, userSelect: "none",
              }}>
                <div>
                  <div style={{ fontSize: 15, lineHeight: "20px", color: "#1E395B" }}>My Projects library</div>
                  <div style={{ fontSize: 11.5, color: "#5A677C" }}>Includes: 1 location</div>
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", fontSize: 11.5, color: "#5A677C" }}>
                  Arrange by:
                  <span
                    className="projects-arrange"
                    onMouseDown={keepMenu}
                    onTouchStart={keepMenu}
                    onClick={() => setArrangeOpen((o) => !o)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#1E395B", cursor: "pointer" }}
                  >
                    {arrange}
                    <svg width="7" height="4" viewBox="0 0 7 4">
                      <path d="M0 0h7L3.5 4z" fill="#1E395B" />
                    </svg>
                  </span>
                  {arrangeOpen && (
                    <Menu
                      onClose={() => setArrangeOpen(false)}
                      style={{ top: "100%", right: 0, minWidth: 140, marginTop: 3 }}
                      items={(["Folder", "Name", "Type"] as Arrange[]).map((a) => ({
                        label: a, radio: arrange === a, onClick: () => setArrange(a),
                      }))}
                    />
                  )}
                </div>
              </div>
            )}

            <div
              onClick={() => setSelectedId(null)}
              // manipulation: no double-tap zoom, so both taps of a double-tap reach onItemClick
              style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 6px 8px", touchAction: "manipulation" }}
            >
              {view === "details" && <ColumnHeader compact={isSmallScreen} />}
              {visible.length === 0 ? (
                <div style={{ textAlign: "center", marginTop: 24, fontFamily: FONT, fontSize: 12, color: "#6D6D6D" }}>
                  No items match your search.
                </div>
              ) : (
                groups.map((g) => (
                  <React.Fragment key={g.label || "all"}>
                    {g.label && <SectionHeader label={`${g.label} (${g.items.length})`} />}
                    <div style={{
                      display: "grid", alignItems: "start", gap: view === "details" ? 0 : 2, paddingTop: 2,
                      gridTemplateColumns: isSmallScreen && view === "tiles" ? "1fr" : GRID[view],
                    }}>
                      {g.items.map((p) => (
                        <ProjectItem
                          key={p.id} project={p} view={view} compact={isSmallScreen}
                          selected={p.id === selectedId} onClick={(e) => onItemClick(e, p)}
                        />
                      ))}
                    </div>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </div>

        {panes.details && (
          <ProjectDetails
            project={selected}
            count={visible.length}
            compact={isSmallScreen}
            onOpenLink={(l) => selected && openLink(l, selected)}
          />
        )}

        <StatusBar left={selected ? "1 item selected" : plural(visible.length)} />
      </ExplorerBody>
    </>
  );
}
