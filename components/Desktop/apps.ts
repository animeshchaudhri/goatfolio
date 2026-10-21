import { win7Icon, type Win7IconName } from "../Win7/win7Icons";

// Every openable thing on the desktop, Start menu and context menus, keyed by the name callers use.
// `icon` is an original Win7 icon token ("win7:computer"), a name under /icons ("doom" → /icons/doom.png),
// or a full path.

export type App = { title: string; url: string; type: string; icon?: string };

export const APPS: Record<string, App> = {
  // Desktop icons
  Computer:      { title: "Computer",     url: "",                                           type: "myComputer",  icon: "win7:computer" },
  Internet:      { title: "Internet",     url: "https://www.google.com/?igu=1",              type: "browser",     icon: "win7:iexplore" },
  Twitter:       { title: "Twitter",      url: "https://animeshport.netlify.app/",           type: "browser",     icon: "twitter" },
  Doom:          { title: "Doom",         url: "https://animeshchaudhri.github.io/jsdoom/",  type: "browser",     icon: "doom" },
  "My Projects": { title: "My Projects",  url: "",                                           type: "fileBrowser", icon: "win7:folder" },
  "My Blog":     { title: "My Blog",      url: "/blog?embed=1",                              type: "browser",     icon: "win7:notepad" },
  "My Resume":   { title: "My Resume",    url: "/blog/resume?embed=1",                       type: "browser",     icon: "pdf" },
  "Recycle Bin": { title: "Recycle Bin",  url: "",                                           type: "recycleBin",  icon: "win7:recycle-bin" },

  // Start menu programs
  "Getting started":           { title: "Getting Started",           url: "",                             type: "gettingStarted", icon: "win7:getting-started" },
  Notepad:                     { title: "Notepad",                   url: "",                             type: "Notepad",        icon: "win7:notepad" },
  "Internet Explorer":         { title: "Internet Explorer",         url: "https://www.google.com/?igu=1", type: "browser",        icon: "win7:iexplore" },
  "Sound Settings":            { title: "Sound",                     url: "",                             type: "sound",          icon: "win7:sound" },
  "Remote Desktop Connection": { title: "Remote Desktop Connection", url: "https://www.animesh.us",       type: "browser",        icon: "win7:remote-desktop" },
  Chat:                        { title: "Chat",                      url: "",                             type: "chat",           icon: "win7:messenger" },
  Horror:                      { title: "Horror",                    url: "/videos/horror.mp4",           type: "Videoplayer",    icon: "horror" },

  // Start menu right column (libraries share one component, `url` picks the library)
  Documents:              { title: "Documents",            url: "Documents", type: "library",         icon: "win7:documents" },
  Pictures:               { title: "Pictures",             url: "Pictures",  type: "library",         icon: "win7:pictures" },
  Music:                  { title: "Music",                url: "Music",     type: "library",         icon: "win7:music" },
  Videos:                 { title: "Videos",               url: "Videos",    type: "library",         icon: "win7:videos" },
  Downloads:              { title: "Downloads",            url: "Downloads", type: "library",         icon: "win7:downloads" },
  Games:                  { title: "Games",                url: "",          type: "games",           icon: "win7:games" },
  "Control Panel":        { title: "Control Panel",        url: "",          type: "controlPanel",    icon: "win7:control-panel" },
  "Devices and Printers": { title: "Devices and Printers", url: "",          type: "devicesPrinters", icon: "win7:devices-printers" },
  "Default Programs":     { title: "Default Programs",     url: "",          type: "defaultPrograms", icon: "win7:default-programs" },
  "Help and Support":     { title: "Windows Help and Support", url: "",      type: "helpSupport",     icon: "win7:help" },

  // Desktop context menu / Control Panel
  Personalization:     { title: "Personalization",   url: "", type: "personalization",  icon: "win7:personalization" },
  "Screen Resolution": { title: "Screen Resolution", url: "", type: "screenResolution", icon: "win7:display" },
  Gadgets:             { title: "Gadgets",           url: "", type: "gadgets",          icon: "win7:gadgets" },
};

export type ActionContext = { showDancer: () => void };

export const ACTIONS: Record<string, (ctx: ActionContext) => void> = {
  Github:   () => window.open("https://github.com/animeshchaudhri", "_blank"),
  LinkedIn: () => window.open("https://www.linkedin.com/in/animeshchaudhri", "_blank"),
  Courage:  ({ showDancer }) => showDancer(),
  Pet:      ({ showDancer }) => showDancer(),
};

/** Resolve an icon to a URL; `size` picks the matching native frame of original Win7 icons */
export function iconPath(icon: string | undefined, size = 48): string {
  if (!icon) return "/icons/notepad.png";
  if (icon.startsWith("win7:")) return win7Icon(icon.slice(5) as Win7IconName, size);
  return icon.startsWith("/") ? icon : `/icons/${icon}.png`;
}
