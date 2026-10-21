import { APPS, iconPath } from "../Desktop/apps";

// Every icon the desktop, its menus and the gadgets use: original Win7 icons. Desktop items use the
// 48px "Medium icons" frame, context-menu entries the 16px frame; shortcutOverlay stays a token
// because it's drawn at the icon's own size.
export const ICONS = {
  folder: iconPath("win7:folder", 48),
  textDocument: iconPath("win7:file-text", 48),
  internetShortcut: iconPath("win7:internet-shortcut", 48),
  shortcutOverlay: "win7:shortcut-overlay",
  newFolder: iconPath("win7:folder", 16),
  newTextDocument: iconPath("win7:file-text", 16),
  newShortcut: iconPath("win7:shortcut-overlay", 16),
  screenResolution: iconPath(APPS["Screen Resolution"].icon, 16),
  gadgets: iconPath(APPS.Gadgets.icon, 16),
  personalize: iconPath(APPS.Personalization.icon, 16),
  photoViewer: APPS.Pictures.icon ?? "",
};
