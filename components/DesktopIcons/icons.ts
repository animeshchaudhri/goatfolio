import { APPS, iconPath } from "../Desktop/apps";

// Every icon the desktop, its menus and the gadgets use. Stand-ins until the original Win7
// icons are extracted — swapping one is a one-line change here.
export const ICONS = {
  folder: "/icons/win7/folder.svg",
  textDocument: "/icons/win7/textdoc.svg",
  internetShortcut: "/icons/internet.png",
  shortcutOverlay: "/icons/win7/shortcut-overlay.svg",
  newShortcut: "/icons/win7/new-shortcut.svg",
  screenResolution: iconPath(APPS["Screen Resolution"].icon),
  gadgets: iconPath(APPS.Gadgets.icon),
  personalize: iconPath(APPS.Personalization.icon),
  photoViewer: iconPath(APPS.Pictures.icon),
};
