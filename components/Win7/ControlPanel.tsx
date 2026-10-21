"use client";
import React, { useState } from "react";
import type { WindowProps } from "../Desktop/windows";
import { APPS, iconPath } from "../Desktop/apps";
import { Menu } from "./Chrome";
import { CPWindow, Heading, Link, TaskPane, useNarrow, useNav, useOpen } from "./ControlPanelShell";

// Every icon this window shows. App-backed ones follow APPS; the rest are stand-ins for the Win7 artwork.
const app = (name: string) => iconPath(APPS[name]?.icon);
const ICONS = {
  window: app("Control Panel"),
  catSystem: "/icons/win7/cp-system.svg",
  catNetwork: "/icons/win7/cp-network.svg",
  catHardware: "/icons/win7/cp-hardware.svg",
  catPrograms: "/icons/win7/cp-programs.svg",
  catUsers: "/icons/win7/cp-users.svg",
  catAppearance: "/icons/win7/cp-appearance.svg",
  catClock: "/icons/win7/cp-clock.svg",
  catEase: "/icons/win7/cp-ease.svg",
  actionCenter: "/icons/win7/cp-system.svg",
  firewall: "/icons/internet.png",
  system: "/icons/computer.png",
  windowsUpdate: "/icons/update.png",
  backup: "/icons/win7/documents.svg",
  networkCenter: "/icons/win7/cp-network.svg",
  homeGroup: "/icons/computer.png",
  internetOptions: "/icons/internet.png",
  autoPlay: "/icons/win7/cp-programs.svg",
  programsFeatures: "/icons/win7/cp-programs.svg",
  userAccounts: "/icons/win7/cp-users.svg",
  parentalControls: "/icons/win7/cp-users.svg",
  credentialManager: "/icons/win7/cp-system.svg",
  taskbarStart: "/icons/computer.png",
  easeCenter: "/icons/win7/cp-ease.svg",
  folderOptions: "/icons/win7/folder.svg",
  dateTime: "/icons/win7/cp-clock.svg",
  region: "/icons/win7/cp-network.svg",
  speech: "/icons/sound.png",
  adminTools: "/icons/computer.png",
  deviceManager: "/icons/win7/cp-hardware.svg",
  keyboard: "/icons/win7/cp-hardware.svg",
  mouse: "/icons/win7/cp-hardware.svg",
  notificationIcons: "/icons/computer.png",
  remoteApp: "/icons/win7/cp-network.svg",
  troubleshooting: app("Help and Support"),
  devices: app("Devices and Printers"),
  sound: app("Sound Settings"),
  display: app("Screen Resolution"),
  defaultPrograms: app("Default Programs"),
  gadgets: app("Gadgets"),
  personalization: app("Personalization"),
  gettingStarted: app("Getting started"),
};

// ─── Data ─────────────────────────────────────────────────────────────────────
// `to` is an APPS name, optionally "#view" for windows with in-window pages.

type CPLinkDef = { label: string; to: string };
type Section = { title: string; icon: string; to: string; links: CPLinkDef[] };
type Category = { id: string; name: string; icon: string; to: string; home: CPLinkDef[]; sections: Section[] };

const l = (label: string, to: string): CPLinkDef => ({ label, to });

const CATEGORIES: Category[] = [
  {
    id: "system", name: "System and Security", icon: ICONS.catSystem, to: "Computer",
    home: [l("Review your computer's status", "Computer"), l("Back up your computer", "Documents"), l("Find and fix problems", "Help and Support#basics")],
    sections: [
      { title: "Action Center", icon: ICONS.actionCenter, to: "Computer", links: [
        l("Review your computer's status and resolve issues", "Computer"),
        l("Change User Account Control settings", "Help and Support#basics"),
        l("Troubleshoot common computer problems", "Help and Support#basics")] },
      { title: "Windows Firewall", icon: ICONS.firewall, to: "Internet", links: [
        l("Check firewall status", "Internet"), l("Allow a program through Windows Firewall", "Default Programs#defaults")] },
      { title: "System", icon: ICONS.system, to: "Computer", links: [
        l("View amount of RAM and processor speed", "Computer"), l("Allow remote access", "Remote Desktop Connection"),
        l("See the name of this computer", "Computer"), l("Device Manager", "Devices and Printers")] },
      { title: "Windows Update", icon: ICONS.windowsUpdate, to: "Github", links: [
        l("Check for updates", "Github"), l("View installed updates", "Github")] },
      { title: "Backup and Restore", icon: ICONS.backup, to: "Documents", links: [
        l("Back up your computer", "Documents"), l("Restore files from backup", "Documents")] },
    ],
  },
  {
    id: "network", name: "Network and Internet", icon: ICONS.catNetwork, to: "Internet",
    home: [l("View network status and tasks", "Internet"), l("Choose homegroup and sharing options", "Remote Desktop Connection")],
    sections: [
      { title: "Network and Sharing Center", icon: ICONS.networkCenter, to: "Internet", links: [
        l("View network status and tasks", "Internet"), l("Connect to a network", "Internet"),
        l("View network computers and devices", "Devices and Printers")] },
      { title: "HomeGroup", icon: ICONS.homeGroup, to: "Remote Desktop Connection", links: [
        l("Choose homegroup and sharing options", "Remote Desktop Connection")] },
      { title: "Internet Options", icon: ICONS.internetOptions, to: "Internet Explorer", links: [
        l("Change your homepage", "Internet Explorer"), l("Manage browser add-ons", "Internet Explorer"),
        l("Delete browsing history and cookies", "Internet Explorer")] },
    ],
  },
  {
    id: "hardware", name: "Hardware and Sound", icon: ICONS.catHardware, to: "Devices and Printers",
    home: [l("View devices and printers", "Devices and Printers"), l("Add a device", "Devices and Printers")],
    sections: [
      { title: "Devices and Printers", icon: ICONS.devices, to: "Devices and Printers", links: [
        l("Add a device", "Devices and Printers"), l("Add a printer", "Devices and Printers"),
        l("Mouse", "Devices and Printers"), l("Device Manager", "Devices and Printers")] },
      { title: "AutoPlay", icon: ICONS.autoPlay, to: "Default Programs#autoplay", links: [
        l("Change default settings for media or devices", "Default Programs#autoplay"),
        l("Play CDs or other media automatically", "Default Programs#autoplay")] },
      { title: "Sound", icon: ICONS.sound, to: "Sound Settings", links: [
        l("Adjust system volume", "Sound Settings"), l("Change system sounds", "Sound Settings"),
        l("Manage audio devices", "Sound Settings")] },
      { title: "Display", icon: ICONS.display, to: "Screen Resolution", links: [
        l("Make text and other items larger or smaller", "Help and Support#display"),
        l("Adjust screen resolution", "Screen Resolution"), l("Connect to an external display", "Screen Resolution")] },
    ],
  },
  {
    id: "programs", name: "Programs", icon: ICONS.catPrograms, to: "Default Programs",
    home: [l("Uninstall a program", "Default Programs#defaults")],
    sections: [
      { title: "Programs and Features", icon: ICONS.programsFeatures, to: "Default Programs#defaults", links: [
        l("Uninstall a program", "Default Programs#defaults"), l("View installed updates", "Github"),
        l("Run programs made for previous versions of Windows", "Doom")] },
      { title: "Default Programs", icon: ICONS.defaultPrograms, to: "Default Programs", links: [
        l("Change the file type associated with a file extension", "Default Programs#associate"),
        l("Make a file type always open in a specific program", "Default Programs#associate"),
        l("Set your default programs", "Default Programs#defaults")] },
      { title: "Desktop Gadgets", icon: ICONS.gadgets, to: "Gadgets", links: [
        l("Add gadgets to the desktop", "Gadgets"), l("Get more gadgets online", "Gadgets")] },
    ],
  },
  {
    id: "users", name: "User Accounts and Family Safety", icon: ICONS.catUsers, to: "My Resume",
    home: [l("Add or remove user accounts", "My Resume"), l("Set up parental controls for any user", "Help and Support#about")],
    sections: [
      { title: "User Accounts", icon: ICONS.userAccounts, to: "My Resume", links: [
        l("Change your account picture", "My Resume"), l("Add or remove user accounts", "My Resume"),
        l("Change your Windows password", "Help and Support#about")] },
      { title: "Parental Controls", icon: ICONS.parentalControls, to: "Help and Support#about", links: [
        l("Set up parental controls for any user", "Help and Support#about")] },
      { title: "Credential Manager", icon: ICONS.credentialManager, to: "Help and Support#contact", links: [
        l("Manage Windows Credentials", "Help and Support#contact")] },
    ],
  },
  {
    id: "appearance", name: "Appearance and Personalization", icon: ICONS.catAppearance, to: "Personalization",
    home: [l("Change the theme", "Personalization"), l("Change desktop background", "Personalization#background"),
      l("Adjust screen resolution", "Screen Resolution")],
    sections: [
      { title: "Personalization", icon: ICONS.personalization, to: "Personalization", links: [
        l("Change the theme", "Personalization"), l("Change desktop background", "Personalization#background"),
        l("Change the color of your taskbar and window borders", "Personalization#color"),
        l("Change sound effects", "Sound Settings"), l("Change screen saver", "Screen Saver Settings")] },
      { title: "Display", icon: ICONS.display, to: "Screen Resolution", links: [
        l("Make text and other items larger or smaller", "Help and Support#display"),
        l("Adjust screen resolution", "Screen Resolution")] },
      { title: "Desktop Gadgets", icon: ICONS.gadgets, to: "Gadgets", links: [
        l("Add gadgets to the desktop", "Gadgets"), l("Restore desktop gadgets installed with Windows", "Gadgets")] },
      { title: "Taskbar and Start Menu", icon: ICONS.taskbarStart, to: "Help and Support#start", links: [
        l("Customize the Start menu", "Help and Support#start"), l("Customize icons on the taskbar", "Help and Support#start")] },
      { title: "Ease of Access Center", icon: ICONS.easeCenter, to: "Help and Support#mobile", links: [
        l("Turn High Contrast on or off", "Personalization"), l("Optimize visual display", "Screen Resolution")] },
      { title: "Folder Options", icon: ICONS.folderOptions, to: "Documents", links: [
        l("Show hidden files and folders", "Documents")] },
    ],
  },
  {
    id: "clock", name: "Clock, Language, and Region", icon: ICONS.catClock, to: "Gadgets",
    home: [l("Change keyboards or other input methods", "Devices and Printers")],
    sections: [
      { title: "Date and Time", icon: ICONS.dateTime, to: "Gadgets", links: [
        l("Set the time and date", "Gadgets"), l("Change the time zone", "Gadgets"),
        l("Add clocks for different time zones", "Gadgets")] },
      { title: "Region and Language", icon: ICONS.region, to: "Help and Support#about", links: [
        l("Change location", "Help and Support#about"),
        l("Change keyboards or other input methods", "Devices and Printers")] },
    ],
  },
  {
    id: "ease", name: "Ease of Access", icon: ICONS.catEase, to: "Help and Support#mobile",
    home: [l("Let Windows suggest settings", "Help and Support#mobile"), l("Optimize visual display", "Screen Resolution")],
    sections: [
      { title: "Ease of Access Center", icon: ICONS.easeCenter, to: "Help and Support#mobile", links: [
        l("Let Windows suggest settings", "Help and Support#mobile"), l("Optimize visual display", "Screen Resolution"),
        l("Replace sounds with visual cues", "Sound Settings"), l("Change how your mouse works", "Devices and Printers"),
        l("Change how your keyboard works", "Devices and Printers")] },
      { title: "Speech Recognition", icon: ICONS.speech, to: "Sound Settings", links: [
        l("Start speech recognition", "Sound Settings"), l("Set up a microphone", "Sound Settings")] },
    ],
  },
];

// "All Control Panel Items" (Large / Small icons views)
const ITEMS: { label: string; to: string; icon: string }[] = [
  { label: "Action Center", to: "Computer", icon: ICONS.actionCenter },
  { label: "Administrative Tools", to: "Computer", icon: ICONS.adminTools },
  { label: "AutoPlay", to: "Default Programs#autoplay", icon: ICONS.autoPlay },
  { label: "Backup and Restore", to: "Documents", icon: ICONS.backup },
  { label: "Credential Manager", to: "Help and Support#contact", icon: ICONS.credentialManager },
  { label: "Date and Time", to: "Gadgets", icon: ICONS.dateTime },
  { label: "Default Programs", to: "Default Programs", icon: ICONS.defaultPrograms },
  { label: "Desktop Gadgets", to: "Gadgets", icon: ICONS.gadgets },
  { label: "Device Manager", to: "Devices and Printers", icon: ICONS.deviceManager },
  { label: "Devices and Printers", to: "Devices and Printers", icon: ICONS.devices },
  { label: "Display", to: "Screen Resolution", icon: ICONS.display },
  { label: "Ease of Access Center", to: "Help and Support#mobile", icon: ICONS.easeCenter },
  { label: "Folder Options", to: "Documents", icon: ICONS.folderOptions },
  { label: "Getting Started", to: "Getting started", icon: ICONS.gettingStarted },
  { label: "HomeGroup", to: "Remote Desktop Connection", icon: ICONS.homeGroup },
  { label: "Internet Options", to: "Internet Explorer", icon: ICONS.internetOptions },
  { label: "Keyboard", to: "Devices and Printers", icon: ICONS.keyboard },
  { label: "Mouse", to: "Devices and Printers", icon: ICONS.mouse },
  { label: "Network and Sharing Center", to: "Internet", icon: ICONS.networkCenter },
  { label: "Notification Area Icons", to: "Help and Support#start", icon: ICONS.notificationIcons },
  { label: "Parental Controls", to: "Help and Support#about", icon: ICONS.parentalControls },
  { label: "Personalization", to: "Personalization", icon: ICONS.personalization },
  { label: "Programs and Features", to: "Default Programs#defaults", icon: ICONS.programsFeatures },
  { label: "Region and Language", to: "Help and Support#about", icon: ICONS.region },
  { label: "RemoteApp and Desktop Connections", to: "Remote Desktop Connection", icon: ICONS.remoteApp },
  { label: "Sound", to: "Sound Settings", icon: ICONS.sound },
  { label: "Speech Recognition", to: "Sound Settings", icon: ICONS.speech },
  { label: "System", to: "Computer", icon: ICONS.system },
  { label: "Taskbar and Start Menu", to: "Help and Support#start", icon: ICONS.taskbarStart },
  { label: "Troubleshooting", to: "Help and Support#basics", icon: ICONS.troubleshooting },
  { label: "User Accounts", to: "My Resume", icon: ICONS.userAccounts },
  { label: "Windows Firewall", to: "Internet", icon: ICONS.firewall },
  { label: "Windows Update", to: "Github", icon: ICONS.windowsUpdate },
];

function Ico({ icon, size }: { icon: string; size: number }) {
  return <img src={icon} width={size} height={size} alt="" style={{ flexShrink: 0, objectFit: "contain", display: "block" }} />;
}

// ─── View by ▾ ────────────────────────────────────────────────────────────────
type ViewBy = "category" | "large" | "small";
const VIEW_LABEL: Record<ViewBy, string> = { category: "Category", large: "Large icons", small: "Small icons" };

function ViewByControl({ value, onChange }: { value: ViewBy; onChange: (v: ViewBy) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", whiteSpace: "nowrap", flexShrink: 0 }}>
      <span style={{ color: "#4d4d4d" }}>View by: </span>
      <Link onClick={() => setOpen((o) => !o)}>{VIEW_LABEL[value]} <span style={{ fontSize: 9 }}>▼</span></Link>
      {open && (
        <Menu
          onClose={() => setOpen(false)}
          style={{ right: 0, top: 18, minWidth: 150 }}
          items={(Object.keys(VIEW_LABEL) as ViewBy[]).map((v) => ({
            label: VIEW_LABEL[v], radio: v === value, onClick: () => onChange(v),
          }))}
        />
      )}
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function HomeView({ onCategory }: { onCategory: (id: string) => void }) {
  const open = useOpen();
  const narrow = useNarrow();
  const col = (cats: Category[]) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
      {cats.map((c) => (
        <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => onCategory(c.id)}><Ico icon={c.icon} size={48} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, paddingTop: 2, minWidth: 0 }}>
            <Link className="cp-cat" onClick={() => onCategory(c.id)}>{c.name}</Link>
            {c.home.map((h) => <Link key={h.label} onClick={() => open(h.to)}>{h.label}</Link>)}
          </div>
        </div>
      ))}
    </div>
  );
  return narrow ? (
    <div style={{ marginTop: 10 }}>{col(CATEGORIES)}</div>
  ) : (
    <div style={{ display: "flex", gap: 28, marginTop: 14, paddingLeft: 12 }}>
      {col(CATEGORIES.slice(0, 4))}
      {col(CATEGORIES.slice(4))}
    </div>
  );
}

function CategoryView({ cat }: { cat: Category }) {
  const open = useOpen();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 4 }}>
      {cat.sections.map((s) => (
        <div key={s.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ cursor: "pointer", paddingTop: 1, flexShrink: 0 }} onClick={() => open(s.to)}><Ico icon={s.icon} size={40} /></div>
          <div style={{ minWidth: 0, lineHeight: 1.6 }}>
            <Link className="cp-cat" onClick={() => open(s.to)}>{s.title}</Link>
            <div>
              {s.links.map((lk, i) => (
                <React.Fragment key={lk.label}>
                  {i > 0 && <span style={{ color: "#a0a0a0", margin: "0 7px" }}>|</span>}
                  <Link onClick={() => open(lk.to)}>{lk.label}</Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AllItemsView({ size }: { size: "large" | "small" }) {
  const open = useOpen();
  const narrow = useNarrow();
  const [sel, setSel] = useState<string | null>(null);
  const px = size === "large" ? 32 : 16;
  const cols = narrow ? (size === "large" ? 1 : 2) : size === "large" ? 3 : 4;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: size === "large" ? "4px 10px" : "1px 10px", marginTop: 10 }}>
      {ITEMS.map((it) => (
        <div
          key={it.label}
          className={`cp-tile${sel === it.label ? " is-selected" : ""}`}
          onClick={() => setSel(it.label)}
          onDoubleClick={() => open(it.to)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: size === "large" ? "4px 6px" : "2px 4px", minWidth: 0 }}
        >
          <Ico icon={it.icon} size={px} />
          <Link onClick={() => open(it.to)} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.label}</Link>
        </div>
      ))}
    </div>
  );
}

function SearchView({ q, onCategory }: { q: string; onCategory: (id: string) => void }) {
  const open = useOpen();
  const needle = q.trim().toLowerCase();
  const hits = CATEGORIES.map((c) => {
    const seen = new Set<string>();
    const links = [...c.home, ...c.sections.flatMap((s) => [l(s.title, s.to), ...s.links])].filter((lk) => {
      if (seen.has(lk.label) || !lk.label.toLowerCase().includes(needle)) return false;
      seen.add(lk.label);
      return true;
    });
    return { c, links: c.name.toLowerCase().includes(needle) && links.length === 0 ? c.home : links };
  }).filter((h) => h.links.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 6 }}>
      {hits.length === 0 && <div style={{ color: "#555" }}>No items match your search.</div>}
      {hits.map(({ c, links }) => (
        <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => onCategory(c.id)}><Ico icon={c.icon} size={40} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <Link className="cp-cat" onClick={() => onCategory(c.id)}>{c.name}</Link>
            {links.map((lk) => <Link key={lk.label} onClick={() => open(lk.to)}>{lk.label}</Link>)}
          </div>
        </div>
      ))}
      <div style={{ borderTop: "1px solid #e3e8ef", paddingTop: 10, color: "#555" }}>
        Can&apos;t find what you are looking for?{" "}
        <Link onClick={() => open(`Help and Support#search:${q.trim()}`)}>Search Windows Help and Support for &quot;{q.trim()}&quot;</Link>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type View = { kind: "home" } | { kind: "cat"; id: string } | { kind: "all"; size: "large" | "small" };

export default function ControlPanel({ app, ...props }: WindowProps) {
  // `app.url` can name a category, e.g. "Control Panel#appearance" from a breadcrumb
  const nav = useNav<View>(CATEGORIES.some((c) => c.id === app.url) ? { kind: "cat", id: app.url } : { kind: "home" });
  const [q, setQ] = useState("");
  const view = nav.cur;
  const cat = view.kind === "cat" ? CATEGORIES.find((c) => c.id === view.id) : undefined;
  const go = (v: View) => { setQ(""); nav.go(v); };
  const goCat = (id: string) => go({ kind: "cat", id });
  const setViewBy = (v: ViewBy) => go(v === "category" ? { kind: "home" } : { kind: "all", size: v });

  const path = q.trim()
    ? ["Control Panel", "Search Results"]
    : cat ? ["Control Panel", cat.name]
    : view.kind === "all" ? ["Control Panel", "All Control Panel Items"]
    : ["Control Panel"];

  const taskPane = cat && !q.trim() ? (
    <TaskPane>
      <Link className="cp-task" onClick={() => go({ kind: "home" })}>Control Panel Home</Link>
      <div style={{ height: 4 }} />
      {CATEGORIES.map((c) => c.id === cat.id
        ? <span key={c.id} style={{ fontWeight: 700, color: "#000", lineHeight: 1.35 }}>{c.name}</span>
        : <Link key={c.id} className="cp-task" onClick={() => goCat(c.id)}>{c.name}</Link>
      )}
    </TaskPane>
  ) : undefined;

  return (
    <CPWindow
      {...props}
      title={app.title}
      icon={ICONS.window}
      path={path}
      onBack={nav.back && (() => { setQ(""); nav.back!(); })}
      onForward={nav.fwd && (() => { setQ(""); nav.fwd!(); })}
      onCrumb={(i) => i <= 0 && go({ kind: "home" })}
      search={q}
      onSearch={setQ}
      taskPane={taskPane}
    >
      {q.trim() ? (
        <SearchView q={q} onCategory={goCat} />
      ) : cat ? (
        <CategoryView cat={cat} />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <Heading style={{ margin: 0 }}>Adjust your computer&apos;s settings</Heading>
            <ViewByControl value={view.kind === "all" ? view.size : "category"} onChange={setViewBy} />
          </div>
          {view.kind === "all" ? <AllItemsView size={view.size} /> : <HomeView onCategory={goCat} />}
        </>
      )}
    </CPWindow>
  );
}
