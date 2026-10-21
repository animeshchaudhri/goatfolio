"use client";
import { createContext, useContext } from "react";
import type { App } from "./apps";

export interface DesktopContextValue {
  /** Open (or focus) an entry from APPS / run an entry from ACTIONS by name, or open an ad-hoc App */
  openApp: (target: string | App) => void;
  /** Image URL ("/images/wallpaper2.jpg") or CSS color ("#3a6ea5") */
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
}

export const DesktopContext = createContext<DesktopContextValue>({
  openApp: () => {},
  wallpaper: "/images/wallpaper2.jpg",
  setWallpaper: () => {},
});

export function useDesktop() {
  return useContext(DesktopContext);
}
