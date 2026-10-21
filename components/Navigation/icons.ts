// Every icon the Start menu, taskbar, tray flyouts and logon screens use. "win7:<name>" tokens are original
// Windows 7 icons resolved per pixel size with iconPath(icon, size); /images/win7 holds original shell artwork.
// App/program icons come from APPS (components/Desktop/apps.ts) via iconPath(); these are the extras.

export const ICONS = {
  startOrb:         "/images/win7/start-orb.png",
  startOrbHover:    "/images/win7/start-orb-hover.png",
  startOrbPressed:  "/images/win7/start-orb-pressed.png",
  userFrame:        "/images/win7/user-frame.png",
  userPicture:      "/icons/courage.png",
  folder:           "win7:folder",
  folderOpen:       "win7:folder-open",
  fallback:         "/icons/notepad.png",
  // Notification area (16px) and flyouts (24–32px)
  actionCenter:     "/tray/action1.png",
  network:          "/tray/network.png",
  volumeMuted:      "/tray/audio1.png",
  volumeLow:        "/tray/audio4.png",
  volumeMedium:     "/tray/audio3.png",
  volumeHigh:       "/tray/audio2.png",
  speakers:         "win7:sound",
  // ACTIONS (no APPS entry)
  pet:              "/icons/courage.png",
  github:           "/icons/github.png",
  linkedin:         "/icons/linkedin.png",
  messenger:        "win7:messenger",
  // Logon / lock screen
  logonBackground:  "/images/win7/logon-background.png",
  logonPower:       "/images/win7/logon-power.png",
  logonPowerHover:  "/images/win7/logon-power-hover.png",
  logonPowerPressed: "/images/win7/logon-power-pressed.png",
} as const;
