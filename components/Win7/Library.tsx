"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useDesktop } from "../Desktop/DesktopContext";
import { APPS, type App } from "../Desktop/apps";
import type { WindowProps } from "../Desktop/windows";
import { desktopIcons } from "../Icons";
import { useWindowSize } from "../../hooks/useWindowSize";
import {
  EXPLORER_CANCEL, TitleBar, AddressBar, CommandBar, NavPane, ExplorerBody, DetailsPane, StatusBar,
  type Command, type MenuItem, type ViewMode,
} from "./Chrome";
import {
  ItemsView, LibraryHeader, imgIcon, folderIcon, withShortcut, textIcon, pdfIcon, mediaIcon, thumbIcon, videoThumb,
  type FileItem,
} from "./FileView";
import { EXPLORER_ICONS as E } from "./explorerIcons";

// Explorer window for libraries and folders. `app.url` is the starting location key:
// a library ("Documents"), a special folder ("Desktop", "Network") or a drive path
// ("Local Disk (C:)/Users/Animesh").

const DATE = "7/8/2026 9:17 PM";
const LIBRARIES = ["Documents", "Music", "Pictures", "Videos"];
const ARRANGE = ["Folder", "Name", "Date modified", "Type", "Size"];
const NAV_LABELS = ["Favorites", "Desktop", "Downloads", "Recent Places", "Libraries", ...LIBRARIES,
  "Network", "Local Disk (C:)", "DVD RW Drive (D:)"];

// Address-bar / details-pane icon per location
const ICONS: Record<string, string> = {
  Libraries: E.libraries,
  Documents: E.documents,
  Music: E.music,
  Pictures: E.pictures,
  Videos: E.videos,
  Downloads: E.downloads,
  Desktop: E.desktop,
  Favorites: E.favorites,
  "Recent Places": E.recentPlaces,
  Network: E.network,
  "Local Disk (C:)": E.localDisk,
  "DVD RW Drive (D:)": E.dvdDrive,
  "animesh's cloud (Z:)": E.networkDrive,
};

const PICTURES = [
  { name: "wallpaper",  src: "/images/wallpaper.jpg",  size: "628 KB", dims: "1920 x 1200" },
  { name: "wallpaper2", src: "/images/wallpaper2.jpg", size: "133 KB", dims: "1920 x 1080" },
];

// background.mp4 is 39 MB: listed, never previewed
const VIDEOS = [
  { name: "Courage",    src: "/videos/Courage.mp4",    size: "1,345 KB",  length: "00:00:12", dims: "1080 x 1920", preview: true },
  { name: "horror",     src: "/videos/horror.mp4",     size: "240 KB",    length: "00:00:07", dims: "640 x 356",   preview: true },
  { name: "shutdown",   src: "/videos/shutdown.mp4",   size: "4,553 KB",  length: "00:00:23", dims: "1280 x 720",  preview: true },
  { name: "background", src: "/videos/background.mp4", size: "38,134 KB", length: "00:00:25", dims: "1920 x 1080", preview: false },
];

const C_FOLDERS: Record<string, string[]> = {
  "Local Disk (C:)": ["PerfLogs", "Program Files", "Program Files (x86)", "Users", "Windows"],
  "Local Disk (C:)/Users": ["Animesh", "Public"],
  "Local Disk (C:)/Users/Animesh": ["Contacts", "Desktop", "Documents", "Downloads", "Favorites", "Links", "Music", "Pictures", "Saved Games", "Searches", "Videos"],
  "Local Disk (C:)/Users/Public": ["Public Documents", "Public Downloads", "Public Music", "Public Pictures", "Public Videos"],
  "Local Disk (C:)/Program Files": ["Common Files", "Internet Explorer", "Windows Defender", "Windows Media Player", "Windows Photo Viewer", "Windows Sidebar"],
  "Local Disk (C:)/Program Files (x86)": ["Common Files", "id Software", "Internet Explorer"],
  "Local Disk (C:)/Program Files (x86)/id Software": ["DOOM"],
  "Local Disk (C:)/Windows": ["Fonts", "Help", "System32", "Web"],
  "Local Disk (C:)/Windows/Web": ["Wallpaper"],
};

/** App that opens an Explorer window at `key` (registry entry when one exists) */
export function locationApp(key: string): App {
  if (APPS[key]) return APPS[key];
  return { title: key.split("/").pop()!, url: key, type: "library", icon: ICONS[key] ?? E.folder };
}

/** Nav-pane click from a window that can't navigate in place: open the location in its own window */
export function openNavLocation(openApp: (target: string | App) => void, label: string) {
  openApp(label === "Computer" ? "Computer" : locationApp(label));
}

type Location = {
  path: string[];
  /** Location key per breadcrumb segment; null = the Computer window */
  crumbs: (string | null)[];
  icon: string;
  items: FileItem[];
  view: ViewMode;
  header?: { title: string; subtitle?: string; library?: boolean };
  emptyText?: string;
  canCreate?: boolean;
  kind?: "pictures" | "music" | "videos";
};

type Env = {
  go: (key: string) => void;
  openApp: (target: string | App) => void;
  play: () => void;
  extra: Record<string, string[]>;
};

const folder = (env: Env, name: string, target: string): FileItem => ({
  name, icon: folderIcon, type: "File folder", modified: DATE, onOpen: () => env.go(target),
});

const program = (env: Env, name: string, icon: string, appName: string): FileItem => ({
  name, icon: imgIcon(icon), type: "Application", modified: DATE, size: "1,024 KB", onOpen: () => env.openApp(appName),
});

const pictureItems = (env: Env): FileItem[] => PICTURES.map((p) => ({
  name: p.name, icon: thumbIcon(p.src), type: "JPEG image", size: p.size, modified: DATE,
  details: [["Dimensions:", p.dims]],
  onOpen: () => env.openApp({ title: `${p.name}.jpg`, url: p.src, type: "browser", icon: ICONS.Pictures }),
}));

function libraryItems(env: Env, lib: string): FileItem[] {
  switch (lib) {
    case "Documents": return [
      { name: "My Projects", icon: folderIcon, type: "File folder", modified: DATE, onOpen: () => env.openApp("My Projects") },
      { name: "Blog", icon: withShortcut(imgIcon(E.internetShortcut)), type: "Internet Shortcut", size: "1 KB", modified: DATE, onOpen: () => env.openApp("My Blog") },
      { name: "readme", icon: textIcon, type: "Text Document", size: "1 KB", modified: DATE, onOpen: () => env.openApp("Notepad") },
      { name: "Resume", icon: pdfIcon, type: "PDF File", size: "97 KB", modified: DATE, onOpen: () => env.openApp("My Resume") },
    ];
    case "Pictures": return pictureItems(env);
    case "Music": return [
      { name: "Start", icon: mediaIcon("audio"), type: "MP3 Format Sound", size: "80 KB", modified: DATE,
        details: [["Length:", "00:00:05"], ["Bit rate:", "128 kbps"]], onOpen: env.play },
    ];
    case "Videos": return VIDEOS.map((v) => ({
      name: v.name, icon: videoThumb(v.preview ? v.src : undefined), type: "MP4 Video", size: v.size, modified: DATE,
      details: [["Length:", v.length], ["Frame size:", v.dims]],
      onOpen: () => v.name === "horror"
        ? env.openApp("Horror")
        : env.openApp({ title: `${v.name}.mp4`, url: v.src, type: "Videoplayer", icon: ICONS.Videos }),
    }));
    default: return [];
  }
}

function resolve(key: string, env: Env): Location {
  const extra = (env.extra[key] ?? []).map((n) => folder(env, n, `${key}/${n}`));
  const withExtra = (loc: Location): Location => ({ ...loc, items: [...loc.items, ...extra] });

  if (key === "Libraries") {
    return {
      path: ["Libraries"], crumbs: ["Libraries"], icon: ICONS.Libraries, view: "tiles",
      header: { title: "Libraries", subtitle: "Open a library to see your files and arrange them by folder, date, and other properties." },
      items: LIBRARIES.map((l) => ({ name: l, icon: imgIcon(ICONS[l]), type: "Library", onOpen: () => env.go(l) })),
    };
  }
  if (LIBRARIES.includes(key)) {
    return withExtra({
      path: ["Libraries", key], crumbs: ["Libraries", key], icon: ICONS[key],
      view: key === "Music" ? "details" : key === "Documents" ? "tiles" : "large",
      header: { title: `${key} library`, library: true }, canCreate: true,
      kind: key === "Pictures" ? "pictures" : key === "Music" ? "music" : key === "Videos" ? "videos" : undefined,
      items: libraryItems(env, key),
    });
  }
  if (key === "Downloads") {
    return withExtra({
      path: ["Animesh", "Downloads"], crumbs: ["Local Disk (C:)/Users/Animesh", "Downloads"],
      icon: ICONS.Downloads, view: "details", items: [], canCreate: true,
    });
  }
  if (key === "Desktop") {
    const system: FileItem[] = [
      { name: "Libraries", icon: imgIcon(ICONS.Libraries), type: "System Folder", onOpen: () => env.go("Libraries") },
      { name: "Animesh", icon: imgIcon(E.userFolder), type: "System Folder", onOpen: () => env.go("Local Disk (C:)/Users/Animesh") },
      { name: "Computer", icon: imgIcon(E.computer), type: "System Folder", onOpen: () => env.openApp("Computer") },
      { name: "Network", icon: imgIcon(ICONS.Network), type: "System Folder", onOpen: () => env.go("Network") },
      { name: "Control Panel", icon: imgIcon(E.controlPanel), type: "System Folder", onOpen: () => env.openApp("Control Panel") },
      { name: "Recycle Bin", icon: imgIcon(E.recycleBin), type: "System Folder", onOpen: () => env.openApp("Recycle Bin") },
    ];
    const shortcuts = desktopIcons
      .filter((d) => !["Computer", "Recycle Bin"].includes(d.title))
      .map((d): FileItem => ({
        name: d.title, icon: withShortcut(imgIcon(d.img)), type: "Shortcut", size: "2 KB", modified: DATE,
        onOpen: () => env.openApp(d.title),
      }));
    return withExtra({ path: ["Desktop"], crumbs: ["Desktop"], icon: ICONS.Desktop, view: "tiles", items: [...system, ...shortcuts], canCreate: true });
  }
  if (key === "Favorites" || key === "Recent Places") {
    const targets = key === "Favorites" ? ["Desktop", "Downloads", "Recent Places"] : ["Documents", "Pictures", "Downloads", "Desktop"];
    return {
      path: [key], crumbs: [key], icon: ICONS[key], view: "tiles",
      items: targets.map((t) => ({
        name: t, icon: withShortcut(ICONS[t] ? imgIcon(ICONS[t]) : folderIcon), type: "Shortcut", size: "1 KB", modified: DATE,
        onOpen: () => env.go(t),
      })),
    };
  }
  if (key === "Network") {
    return {
      path: ["Network"], crumbs: ["Network"], icon: ICONS.Network, view: "large",
      items: [{ name: "ANIMESH-PC", icon: imgIcon(E.computer), type: "Computer", onOpen: () => env.openApp("Computer") }],
    };
  }
  if (key === "DVD RW Drive (D:)") {
    return {
      path: ["Computer", key], crumbs: [null, key], icon: ICONS[key], view: "large", items: [],
      emptyText: "Please insert a disc into DVD RW Drive (D:).",
    };
  }
  if (key === "animesh's cloud (Z:)") {
    const link = (name: string, icon: (size: number) => React.ReactNode, appName: string): FileItem => ({
      name, icon: withShortcut(icon), type: "Internet Shortcut", size: "1 KB", modified: DATE, onOpen: () => env.openApp(appName),
    });
    return withExtra({
      path: ["Computer", key], crumbs: [null, key], icon: ICONS[key], view: "tiles", canCreate: true,
      items: [
        link("GitHub", imgIcon(E.github), "Github"),
        link("LinkedIn", imgIcon(E.linkedin), "LinkedIn"),
        link("Blog", imgIcon(E.internetShortcut), "My Blog"),
        link("Resume", pdfIcon, "My Resume"),
      ],
    });
  }

  // Drive paths: "<drive>/<folder>/…" → breadcrumb Computer ▸ drive ▸ folder ▸ …
  const segs = key.split("/");
  const crumbs: (string | null)[] = [null, ...segs.map((_, i) => segs.slice(0, i + 1).join("/"))];
  const path = ["Computer", ...segs];
  const base: Location = { path, crumbs, icon: segs.length === 1 ? ICONS[segs[0]] ?? E.networkDrive : E.folder, view: "details", items: [], canCreate: true };

  // C:\Users\Animesh\<library> shows the same files as the library, without the library header
  const user = key.match(/^Local Disk \(C:\)\/Users\/Animesh\/(Documents|Music|Pictures|Videos|Downloads|Desktop|Favorites)$/);
  if (user) {
    const loc = resolve(user[1], env);
    return withExtra({ ...loc, path, crumbs, header: undefined, items: loc.items.filter((i) => !(env.extra[user[1]] ?? []).includes(i.name)) });
  }

  const children = C_FOLDERS[key];
  if (children) {
    const items = children.map((n) => folder(env, n, `${key}/${n}`));
    if (key === "Local Disk (C:)/Windows") items.push(program(env, "notepad", E.notepad, "Notepad"));
    return withExtra({ ...base, items });
  }
  if (key.endsWith("/Internet Explorer")) return withExtra({ ...base, items: [program(env, "iexplore", E.iexplore, "Internet Explorer")] });
  if (key.endsWith("/id Software/DOOM")) return withExtra({ ...base, items: [program(env, "doom", E.doom, "Doom")] });
  if (key === "Local Disk (C:)/Windows/Web/Wallpaper") return withExtra({ ...base, view: "large", kind: "pictures", items: pictureItems(env) });
  return withExtra(base);
}

function sortItems(items: FileItem[], by: string): FileItem[] {
  if (by === "Folder") return items;
  const sizeOf = (i: FileItem) => parseFloat((i.size ?? "0").replace(/,/g, ""));
  const key: Record<string, (a: FileItem, b: FileItem) => number> = {
    Name: (a, b) => a.name.localeCompare(b.name),
    "Date modified": (a, b) => (a.modified ?? "").localeCompare(b.modified ?? ""),
    Type: (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name),
    Size: (a, b) => sizeOf(b) - sizeOf(a),
  };
  return [...items].sort(key[by]);
}

export default function Library({ app, onClose, zIndex, onFocus, minimized, onMinimize }: WindowProps) {
  const { openApp, setWallpaper } = useDesktop();
  const small = useWindowSize();
  const [hist, setHist] = useState({ stack: [app.url || "Libraries"], index: 0 });
  const [sel, setSel] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [arrange, setArrange] = useState("Folder");
  const [views, setViews] = useState<Record<string, ViewMode>>({});
  const [extra, setExtra] = useState<Record<string, string[]>>({});
  const [showNav, setShowNav] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const key = hist.stack[hist.index];

  const go = useCallback((target: string) => {
    setHist((h) => ({ stack: [...h.stack.slice(0, h.index + 1), target], index: h.index + 1 }));
    setSel(null);
    setSearch("");
    setArrange("Folder");
  }, []);

  const step = (d: number) => {
    setHist((h) => ({ ...h, index: h.index + d }));
    setSel(null);
    setSearch("");
  };

  // State follows the element's events: the play() promise can reject even when playback starts
  const play = useCallback(() => {
    if (!audio.current) {
      audio.current = new Audio("/Sounds/Start.mp3");
      audio.current.onplaying = () => setPlaying(true);
      audio.current.onpause = () => setPlaying(false);
      audio.current.onended = () => setPlaying(false);
    }
    audio.current.currentTime = 0;
    audio.current.play().catch(() => {});
  }, []);
  const stop = () => { audio.current?.pause(); setPlaying(false); };
  useEffect(() => () => { audio.current?.pause(); }, []);

  const loc = resolve(key, { go, openApp, play, extra });
  const view = views[key] ?? loc.view;
  const q = search.trim().toLowerCase();
  const items = sortItems(q ? loc.items.filter((i) => i.name.toLowerCase().includes(q)) : loc.items, arrange);
  const selected = sel !== null ? items[sel] ?? null : null;
  const title = loc.path[loc.path.length - 1];

  const newFolder = () => {
    const names = new Set(loc.items.map((i) => i.name));
    let name = "New folder";
    for (let n = 2; names.has(name); n++) name = `New folder (${n})`;
    setExtra((e) => ({ ...e, [key]: [...(e[key] ?? []), name] }));
  };

  const refresh = () => {
    setRefreshing(true);
    setSel(null);
    setTimeout(() => setRefreshing(false), 180);
  };

  const organize: MenuItem[] = [
    { label: "Cut", disabled: true }, { label: "Copy", disabled: true }, { label: "Paste", disabled: true },
    { label: "Undo", disabled: true }, { label: "Redo", disabled: true, divider: true },
    { label: "Details pane", checked: showDetails, onClick: () => setShowDetails((v) => !v) },
    { label: "Navigation pane", checked: showNav, onClick: () => setShowNav((v) => !v), divider: true },
    { label: "Close", onClick: onClose },
  ];

  const commands: Command[] = [{ label: "Organize", menu: organize }];
  if (selected?.onOpen && loc.kind !== "pictures" && loc.kind !== "videos" && loc.kind !== "music") {
    commands.push({ label: "Open", onClick: selected.onOpen });
  }
  if (loc.kind === "pictures") {
    if (selected) {
      const src = PICTURES.find((p) => p.name === selected.name)?.src;
      commands.push({ label: "Preview", onClick: selected.onOpen });
      if (src) commands.push({ label: "Set as desktop background", onClick: () => setWallpaper(src) });
    }
    commands.push({ label: "Slide show", onClick: () => (selected ?? items[0])?.onOpen?.() });
  }
  if (loc.kind === "music") {
    commands.push(playing ? { label: "Stop", onClick: stop } : { label: selected ? "Play" : "Play all", onClick: play });
  }
  if (loc.kind === "videos") {
    commands.push({ label: selected ? "Play" : "Play all", onClick: () => (selected ?? items[0])?.onOpen?.() });
  }
  if (loc.canCreate && !q) commands.push({ label: "New folder", onClick: newFolder });

  const navSel = NAV_LABELS.includes(key) ? key : "";
  const navTo = (label: string) => (label === "Computer" ? openApp("Computer") : go(label));
  const crumbTo = (i: number) => {
    const target = i < 0 ? "Desktop" : loc.crumbs[i];
    if (target === null) openApp("Computer");
    else if (target !== key) go(target);
  };

  const count = `${items.length} item${items.length === 1 ? "" : "s"}`;
  const libraryLocations: MenuItem[] = [
    { label: `My ${title}   (C:\\Users\\Animesh)`, onClick: () => go(`Local Disk (C:)/Users/Animesh/${title}`) },
    { label: `Public ${title}   (C:\\Users\\Public)`, onClick: () => go(`Local Disk (C:)/Users/Public/Public ${title}`) },
  ];

  return (
    <DraggableWindow
      cancelSelector={EXPLORER_CANCEL}
      zIndex={zIndex}
      width="800px"
      height="540px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <TitleBar title="" onClose={onClose} />
      <AddressBar
        icon={loc.icon}
        path={loc.path}
        searchPlaceholder={small ? undefined : `Search ${title}`}
        search={search}
        onSearch={(v) => { setSearch(v); setSel(null); }}
        onBack={hist.index > 0 ? () => step(-1) : undefined}
        onForward={hist.index < hist.stack.length - 1 ? () => step(1) : undefined}
        onCrumb={crumbTo}
        onRefresh={refresh}
      />
      <ExplorerBody>
        <CommandBar
          commands={commands}
          view={view}
          onViewChange={(v) => setViews((s) => ({ ...s, [key]: v }))}
        />
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          {showNav && !small && <NavPane navSel={navSel} onSelect={navTo} />}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {loc.header && !q && (
              <LibraryHeader
                title={loc.header.title}
                subtitle={loc.header.subtitle}
                includes={loc.header.library ? libraryLocations : undefined}
                arrange={arrange}
                arrangeOptions={loc.header.library ? ARRANGE : undefined}
                onArrange={setArrange}
              />
            )}
            <ItemsView
              items={refreshing ? [] : items}
              view={view}
              selected={sel}
              onSelect={setSel}
              emptyText={refreshing ? "" : q ? "No items match your search." : loc.emptyText}
            />
          </div>
        </div>
        {showDetails && (
          selected ? (
            <DetailsPane
              icon={selected.icon(48)}
              title={selected.name}
              subtitle={selected.type}
              props={small ? [] : [
                ...(selected.modified ? [["Date modified:", selected.modified] as [string, string]] : []),
                ...(selected.size ? [["Size:", selected.size] as [string, string]] : []),
                ...(selected.details ?? []),
              ]}
            />
          ) : (
            <DetailsPane
              icon={imgIcon(loc.icon)(48)}
              title={count}
              props={loc.header?.library && !small ? [["Library includes:", "2 locations"]] : []}
            />
          )
        )}
        <StatusBar left={selected ? "1 item selected" : count} right={selected?.size} />
      </ExplorerBody>
    </DraggableWindow>
  );
}
