"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DesktopSurface from "../DesktopIcons/DesktopSurface";
import Taskbar from "../Navigation/Taskbar";
import "7.css/dist/7.css";
import GadgetLayer from "../Gadgets/GadgetLayer";
import { GadgetsContext, useGadgetsState } from "../Gadgets/GadgetsContext";
import GreenScreenDancer from "../Dancer/GreenScreenDancer";
import { APPS, ACTIONS, type App } from "./apps";
import { WINDOWS } from "./windows";
import { DesktopContext } from "./DesktopContext";

export type { App } from "./apps";

const DEFAULT_WALLPAPER = "/images/wallpaper2.jpg";

function Desktop({ initialBlog }: { initialBlog?: string } = {}) {
  const [openApps, setOpenApps] = useState<App[]>(() =>
    initialBlog
      ? [{ title: "My Blog", url: `/blog/${initialBlog}?embed=1`, type: "browser", icon: "notepad" }]
      : []
  );
  const [minimizedApps, setMinimizedApps] = useState<Set<string>>(new Set());
  const [showDancer, setShowDancer] = useState(false);
  const [wallpaper, setWallpaperState] = useState(DEFAULT_WALLPAPER);
  const gadgets = useGadgetsState();

  useEffect(() => {
    const saved = localStorage.getItem("wallpaper");
    if (saved) setWallpaperState(saved);
  }, []);

  const setWallpaper = useCallback((w: string) => {
    setWallpaperState(w);
    localStorage.setItem("wallpaper", w);
  }, []);

  const closeApp = (title: string) => {
    setOpenApps((prev) => prev.filter((app) => app.title !== title));
    setMinimizedApps((prev) => { const s = new Set(prev); s.delete(title); return s; });
  };

  const focusApp = useCallback((title: string) => {
    setOpenApps((prev) => {
      const app = prev.find((a) => a.title === title);
      if (!app) return prev;
      return [...prev.filter((a) => a.title !== title), app];
    });
  }, []);

  const addApp = useCallback((newApp: App) => {
    setOpenApps((prev) =>
      prev.some((app) => app.title === newApp.title)
        ? [...prev.filter((a) => a.title !== newApp.title), prev.find((a) => a.title === newApp.title)!]
        : [...prev, newApp]
    );
    setMinimizedApps((prev) => { const s = new Set(prev); s.delete(newApp.title); return s; });
  }, []);

  const openApp = useCallback((target: string | App) => {
    if (typeof target !== "string") addApp(target);
    else if (ACTIONS[target]) ACTIONS[target]({ showDancer: () => setShowDancer(true) });
    else if (APPS[target]) addApp(APPS[target]);
  }, [addApp]);

  const minimizeApp = (title: string) => {
    setMinimizedApps((prev) => { const s = new Set(prev); s.add(title); return s; });
  };

  const taskbarClick = (title: string) => {
    if (minimizedApps.has(title)) {
      setMinimizedApps((prev) => { const s = new Set(prev); s.delete(title); return s; });
    }
    focusApp(title);
  };

  const desktop = useMemo(() => ({ openApp, wallpaper, setWallpaper }), [openApp, wallpaper, setWallpaper]);
  const isImage = wallpaper.startsWith("/") || wallpaper.startsWith("http");

  return (
    <DesktopContext.Provider value={desktop}>
    <GadgetsContext.Provider value={gadgets}>
      <div
        className="absolute inset-0 z-100 overflow-hidden bg-center bg-cover bg-no-repeat"
        style={isImage ? { backgroundImage: `url('${wallpaper}')` } : { backgroundColor: wallpaper }}
        onContextMenu={(e) => {
          // No browser menu on the fake OS, except where text editing/links need it
          if (!(e.target as Element).closest("input, textarea, [contenteditable=true], a")) e.preventDefault();
        }}
      >
        <DesktopSurface />
        <GadgetLayer />

        <Taskbar openApps={openApps} minimizedApps={minimizedApps} closeApp={closeApp} onTaskbarClick={taskbarClick} />

        {showDancer && <GreenScreenDancer onClose={() => setShowDancer(false)} />}

        {openApps.map((app, index) => {
          const Window = WINDOWS[app.type];
          return Window ? (
            <Window
              key={app.title}
              app={app}
              zIndex={index}
              onClose={() => closeApp(app.title)}
              onFocus={() => focusApp(app.title)}
              minimized={minimizedApps.has(app.title)}
              onMinimize={() => minimizeApp(app.title)}
            />
          ) : null;
        })}
      </div>
    </GadgetsContext.Provider>
    </DesktopContext.Provider>
  );
}

export default Desktop;
