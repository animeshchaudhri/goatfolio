"use client";
import { useState } from "react";
import Image from "next/image";
import "7.css/dist/7.css";
import Alertbox from "../Alert/Alertbox";
import ServerClock from "../Clock/ServerClock";
import ShutdownVideo from "../Videoplayer/ShutdownVideo";
import StartMenu from "./StartMenu";
import type { App } from "../Desktop/Desktop";

const KNOWN_ICONS: Record<string, string> = {
  "My Projects": "update",
  "My Blog": "notepad",
  Internet: "internet",
  computer: "computer",
  notepad: "notepad",
  update: "update",
  Horror: "horror",
  Doom: "doom",
  Twitter: "twitter",
};

const getIconPath = (app: App): string => {
  if (app.icon) return `/icons/${app.icon}.png`;
  if (KNOWN_ICONS[app.title]) return `/icons/${KNOWN_ICONS[app.title]}.png`;
  if (!app.title.includes(" ")) return `/icons/${app.title.toLowerCase()}.png`;
  return "/icons/notepad.png";
};

const PROGRAM_APPS: Record<string, App> = {
  "Remote Desktop Connection": { title: "computer",  url: "https://www.animesh.us",           type: "browser",     icon: "computer" },
  "Internet Explorer":         { title: "internet",  url: "https://www.google.com/?igu=1",    type: "browser",     icon: "internet" },
  "Getting started":           { title: "update",    url: "https://localhost:3000",            type: "browser",     icon: "update" },
  Notepad:                     { title: "notepad",   url: "",                                  type: "Notepad",     icon: "notepad" },
  Horror:                      { title: "Horror",    url: "/videos/horror.mp4",               type: "Videoplayer", icon: "horror" },
};

function Taskbar({
  openApps,
  minimizedApps,
  closeApp,
  addApp,
  onTaskbarClick,
}: {
  openApps: App[];
  minimizedApps: Set<string>;
  closeApp: (title: string) => void;
  addApp: (app: App) => void;
  onTaskbarClick: (title: string) => void;
}) {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [shutdown, setShutdown] = useState(false);
  const [shutdownVideo, setShutdownVideo] = useState(false);

  const handleShutdown = async () => {
    setIsStartMenuOpen(false);
    setShutdown(true);
    await new Promise((resolve) => setTimeout(resolve, 7000));
    setShutdown(false);
    setShutdownVideo(true);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    setShutdownVideo(false);
  };

  const handleProgramClick = (programName: string) => {
    const app = PROGRAM_APPS[programName] ?? { title: programName, url: "https://localhost:3000", type: "browser", icon: "internet" };
    addApp(app);
    setIsStartMenuOpen(false);
  };

  return (
    <>
      <div className="[--accent:#434444] [--aero-white:#ffffff7a] [--aero-black:#000000bd] [--aero-color:rgba(116,184,252,calc(0.7*50%))] [--aero-accent:color-mix(in_srgb,#000,color-mix(in_srgb,var(--aero-color)_var(--saturation),transparent)_var(--brightness))] [--saturation:50%] [--brightness:60%] [--intensity:50%]">
        <div className="absolute bottom-0">
          {isStartMenuOpen && (
            <StartMenu
              onShareLink={() => {}}
              onChangeWallpaper={() => {}}
              onShutdown={handleShutdown}
              onProgramClick={handleProgramClick}
            />
          )}
          <div className="h-10 w-screen z-[999] bg-[var(--aero-accent)] backdrop-blur-sm bg-[url('/images/glass.png')] bg-center bg-cover bg-no-repeat bg-fixed outline outline-1 outline-[var(--aero-black)] shadow-[inset_0_1px_0_0_var(--aero-white)] flex items-center">
            <div className="absolute left-0 flex flex-row items-center">
              <div className="absolute w-44 h-12 cursor-pointer" onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}>
                <Image className="absolute left-0 opacity-100" src="/icons/start.png" alt="Start" width={54} height={54} />
              </div>
              <div className="ml-20 flex gap-3">
                {openApps.map((app) => (
                  <div
                    key={app.title}
                    className={`cursor-pointer flex items-center justify-center gap-2 px-3 py-1.5 rounded-t-sm border-[1px] border-b-0 border-[#7DA2CE] shadow-[inset_0_1px_0_0_#ffffff] ${minimizedApps.has(app.title) ? "bg-gradient-to-b from-[#d0e4f8] to-[#b8d0ed] opacity-70" : "bg-gradient-to-b from-[#FEFEFF] to-[#E3F0FE]"}`}
                    onClick={() => onTaskbarClick(app.title)}
                    onContextMenu={(e) => { e.preventDefault(); closeApp(app.title); }}
                  >
                    <Image
                      src={getIconPath(app)}
                      alt={app.title}
                      width={24}
                      height={24}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/icons/notepad.png"; }}
                    />
                    <p className="text-xs text-[#0C3B80] font-medium truncate max-w-[120px]">{app.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute right-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-2.5 text-white w-16">
                <path fill="currentColor" d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
              </svg>
              <Image className="w-4 h-4 mr-2" src="/tray/action1.png" alt="Action" width={30} height={30} />
              <Image className="w-4 h-4 mr-2" src="/tray/network.png" alt="Network" width={30} height={30} />
              <Image className="w-4 h-4 mr-2" src="/tray/audio3.png" alt="Audio" width={30} height={30} />
              <ServerClock />
            </div>
          </div>
        </div>
      </div>

      {shutdown && <Alertbox title="Shutting down pc ..." />}
      {shutdownVideo && <ShutdownVideo />}
    </>
  );
}

export default Taskbar;
