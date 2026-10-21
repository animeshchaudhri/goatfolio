import { APPS } from "../Desktop/apps";

// Every icon the Explorer windows (libraries, Computer, Recycle Bin, Games, Devices and Printers)
// render. Values are icon tokens — "win7:<name>" originals resolve per pixel size via iconPath(icon, size).

const app = (name: string) => APPS[name]?.icon ?? "";

export const EXPLORER_ICONS = {
  // Places / nav pane
  favorites:        "win7:favorites",
  desktop:          "win7:desktop",
  recentPlaces:     "win7:recent-places",
  libraries:        "win7:libraries",
  documents:        app("Documents"),
  music:            app("Music"),
  pictures:         app("Pictures"),
  videos:           app("Videos"),
  downloads:        app("Downloads"),
  computer:         app("Computer"),
  network:          "win7:network",
  userFolder:       "win7:user-folder",
  controlPanel:     app("Control Panel"),
  recycleBin:       app("Recycle Bin"),
  games:            app("Games"),
  devices:          app("Devices and Printers"),

  // Drives
  systemDrive:      "win7:drive-system",
  localDisk:        "win7:drive-hdd",
  dvdDrive:         "win7:drive-dvd",
  networkDrive:     "win7:drive-network",

  // Files
  folder:           "win7:folder",
  textFile:         "win7:file-text",
  pdfFile:          "/icons/pdf.png",
  audioFile:        "win7:file-audio",
  videoFile:        "win7:file-video",
  imageFile:        "win7:file-image",
  internetShortcut: "win7:internet-shortcut",
  shortcutOverlay:  "win7:shortcut-overlay",

  // Programs and links
  notepad:          app("Notepad"),
  iexplore:         app("Internet Explorer"),
  doom:             app("Doom"),
  github:           "/icons/github.png",
  linkedin:         "/icons/linkedin.png",

  // Devices and Printers
  pc:               "win7:computer",
  monitor:          "win7:monitor",
  keyboard:         "win7:keyboard",
  mouse:            "win7:mouse",
  fax:              "win7:fax",
  xpsPrinter:       "win7:printer-xps",
  defaultBadge:     "win7:default-badge",
  commandLink:      "/icons/win7/command-link-arrow.svg",

  // Games
  purblePlace:      "win7:purble-place",

  // Toolbar
  refresh:          "/icons/win7/refresh.svg",
  search:           "/icons/win7/search.svg",
  views:            "/icons/win7/views.svg",
  help:             app("Help and Support"),
} as const;
