"use client";
import React, { useState } from "react";
import DesktopIcon from "../DesktopIcons/DesktopIcons";
import RightClick from "../Navigation/RightClick";
import Taskbar from "../Navigation/Taskbar";
import Browser from "../Browser/Browser";
import "7.css/dist/7.css";
import FileBrowser from "../FileBrowser/FileBroswer";
import { desktopIcons } from "../Icons";
import Notepad from "../Notepad/Notepad";
import Videoplayer from "../Videoplayer/Videoplayer";

export type App = { title: string; url: string; type: string; icon?: string };

const ICON_ACTIONS: Record<string, () => void> = {
  "My Resume": () => window.open("https://drive.google.com/file/d/1Z7yJdrPmj39RI2LdGjjcK0NOk6kfOc-6/view?usp=sharing"),
  Github: () => window.open("https://github.com/animeshchaudhri"),
  LinkedIn: () => window.open("https://www.linkedin.com/in/animeshchaudhri", "_blank"),
  "Recycle Bin": () => alert("There's nothing to delete!"),
};

const ICON_APPS: Record<string, App> = {
  Internet:     { title: "Internet",     url: "https://www.google.com/?igu=1",              type: "browser",      icon: "internet" },
  Twitter:      { title: "Twitter",      url: "https://animeshport.netlify.app/",            type: "browser",      icon: "twitter" },
  Doom:         { title: "Doom",         url: "https://animeshchaudhri.github.io/jsdoom/",  type: "browser",      icon: "doom" },
  "My Projects":{ title: "My Projects", url: "",                                             type: "fileBrowser",  icon: "update" },
  "My Blog":    { title: "My Blog",      url: "/blog",                                       type: "browser",      icon: "notepad" },
};

function Desktop() {
  const [rightClickPos, setRightClickPos] = useState<{ x: number; y: number } | null>(null);
  const [openApps, setOpenApps] = useState<App[]>([]);
  const [minimizedApps, setMinimizedApps] = useState<Set<string>>(new Set());

  const closeApp = (title: string) => {
    setOpenApps((prev) => prev.filter((app) => app.title !== title));
    setMinimizedApps((prev) => { const s = new Set(prev); s.delete(title); return s; });
  };

  const addApp = (newApp: App) => {
    setOpenApps((prev) =>
      prev.some((app) => app.title === newApp.title) ? prev : [...prev, newApp]
    );
  };

  const focusApp = (title: string) => {
    setOpenApps((prev) => {
      const app = prev.find((a) => a.title === title);
      if (!app) return prev;
      return [...prev.filter((a) => a.title !== title), app];
    });
  };

  const minimizeApp = (title: string) => {
    setMinimizedApps((prev) => { const s = new Set(prev); s.add(title); return s; });
  };

  const taskbarClick = (title: string) => {
    if (minimizedApps.has(title)) {
      setMinimizedApps((prev) => { const s = new Set(prev); s.delete(title); return s; });
      focusApp(title);
    } else {
      focusApp(title);
    }
  };

  const iconClicked = (title: string) => {
    if (ICON_ACTIONS[title]) {
      ICON_ACTIONS[title]();
    } else if (ICON_APPS[title]) {
      addApp(ICON_APPS[title]);
    }
  };

  return (
    <div
      className="absolute inset-0 z-100 overflow-hidden bg-[url('/images/wallpaper2.jpg')] bg-center bg-cover bg-no-repeat"
      onContextMenu={(e) => { e.preventDefault(); setRightClickPos({ x: e.clientX, y: e.clientY }); }}
      onClick={() => setRightClickPos(null)}
    >
      {desktopIcons.map((icon, index) => (
        <DesktopIcon
          key={icon.title}
          title={icon.title}
          img={icon.img}
          index={index}
          maxIconsPerColumn={6}
          doubleClick={() => iconClicked(icon.title)}
        />
      ))}

      <Taskbar openApps={openApps} minimizedApps={minimizedApps} closeApp={closeApp} addApp={addApp} onTaskbarClick={taskbarClick} />

      {rightClickPos && (
        <div style={{ position: "absolute", top: rightClickPos.y, left: rightClickPos.x, zIndex: 9999 }}>
          <RightClick />
        </div>
      )}

      {openApps.map((app, index) =>
        app.type === "browser" ? (
          <Browser key={app.title} setIsWindowOpen={() => closeApp(app.title)} url={app.url} title={app.title} zIndex={index} onFocus={() => focusApp(app.title)} minimized={minimizedApps.has(app.title)} onMinimize={() => minimizeApp(app.title)} />
        ) : app.type === "fileBrowser" ? (
          <FileBrowser key={app.title} setIsWindowOpen={() => closeApp(app.title)} title={app.title} zIndex={index} onFocus={() => focusApp(app.title)} minimized={minimizedApps.has(app.title)} onMinimize={() => minimizeApp(app.title)} />
        ) : app.type === "Notepad" ? (
          <Notepad key={app.title} handleClose={() => closeApp(app.title)} zIndex={index} onFocus={() => focusApp(app.title)} minimized={minimizedApps.has(app.title)} onMinimize={() => minimizeApp(app.title)} />
        ) : app.type === "Videoplayer" ? (
          <Videoplayer key={app.title} setIsWindowOpen={() => closeApp(app.title)} url={app.url} title={app.title} zIndex={index} onFocus={() => focusApp(app.title)} minimized={minimizedApps.has(app.title)} onMinimize={() => minimizeApp(app.title)} />
        ) : null
      )}
    </div>
  );
}

export default Desktop;
