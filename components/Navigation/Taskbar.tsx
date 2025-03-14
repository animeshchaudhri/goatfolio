"use client";

import { useState } from "react";
import Image from "next/image";
import "7.css/dist/7.css";

import Alertbox from "../Alert/Alertbox";
import ServerClock from "../Clock/ServerClock";
import ShutdownVideo from "../Videoplayer/ShutdownVideo";
import StartMenu from "./StartMenu";


const getIconPath = (appTitle: string): string => {

  const iconMappings: Record<string, string> = {
    "My Projects": "update",
    "Internet": "internet",
    "computer": "computer",
    "notepad": "notepad",
    "update": "update",
    "Horror": "horror",
    "Doom": "doom",

  };
  

  if (appTitle in iconMappings) {
    return `/icons/${iconMappings[appTitle]}.png`;
  }

  return `/icons/${appTitle.toLowerCase()}.png`;
};

function Taskbar({
  openApps,
  closeApp,
  addApp,
}: {
  openApps: Array<{ title: string; url: string; type: string }>;
  closeApp: (title: string) => void;
  addApp: (app: { title: string; url: string; type: string }) => void;
}) {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [Shutdown, setShutdown] = useState(false);
  const [ShutdowVideo, setShutdowVideo] = useState(false);

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const handleShareLink = () => {
    console.log("Share link clicked");
  };

  const handleChangeWallpaper = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("Wallpaper change triggered", event.target.files);
  };

  const handleShutdown = async () => {
    setIsStartMenuOpen(false);
    setShutdown(true);
    console.log("Shutdown initiated");
    await new Promise((resolve) => setTimeout(resolve, 7000));
    setShutdown(false);
    setShutdowVideo(true);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    setShutdowVideo(false);
  };

  const handleProgramClick = (programName: string) => {
    console.log(`Program clicked: ${programName}`);
    let newApp;
    if (programName === "Remote Desktop Connection") {
      newApp = {
        title: "computer",
        url: "https://www.animesh.us",
        type: "browser",
      };
    } else if (programName === "Internet Explorer") {
      newApp = {
        title: "internet",
        url: "https://www.google.com/?igu=1",
        type: "browser",
      };
    } else if (programName === "Getting started") {
      newApp = {
        title: "update",
        url: "https://localhost:3000",
        type: "browser",
      };
    } else if (programName === "Notepad") {
      newApp = {
        title: "notepad",
        url: "",
        type: "Notepad",
      };
    } else if (programName === "Horror") {
      newApp = {
        title: "Horror",
        url: "/videos/horror.mp4",
        type: "Videoplayer",
      };
    } else {
      newApp = {
        title: programName,
        url: "https://localhost:3000",
        type: "browser",
      };
    }
    addApp(newApp);
    setIsStartMenuOpen(false);
  };

  return (
    <>
      <div className="[--accent:#434444] [--aero-white:#ffffff7a] [--aero-black:#000000bd] [--aero-color:rgba(116,184,252,calc(0.7*50%))] [--aero-accent:color-mix(in_srgb,#000,color-mix(in_srgb,var(--aero-color)_var(--saturation),transparent)_var(--brightness))] [--saturation:50%] [--brightness:60%] [--intensity:50%]">
        <div className="absolute bottom-0 ">
          {isStartMenuOpen && (
            <StartMenu
              onShareLink={handleShareLink}
              onChangeWallpaper={handleChangeWallpaper}
              onShutdown={handleShutdown}
              onProgramClick={handleProgramClick}
            />
          )}
          <div className="h-10 w-screen z-[999] bg-[var(--aero-accent)] backdrop-blur-sm bg-[url('/images/glass.png')] bg-center bg-cover bg-no-repeat bg-fixed outline outline-1 outline-[var(--aero-black)] shadow-[inset_0_1px_0_0_var(--aero-white)] flex items-center">
            <div className="absolute left-0 flex flex-row items-center">
              <div
                className="absolute w-44 h-12 cursor-pointer"
                onClick={toggleStartMenu}
              >
                <Image
                  className="absolute left-0 opacity-100"
                  src="/icons/start.png"
                  alt="Start"
                  width={54}
                  height={54}
                />
              </div>
              <div className="ml-20 flex gap-3">
                {openApps.map((app, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer flex items-center justify-center gap-2 px-3 py-1.5 rounded-t-sm
                      ${openApps.some(a => a.title === app.title) 
                        ? 'bg-gradient-to-b from-[#FEFEFF] to-[#E3F0FE] border-[1px] border-b-0 border-[#7DA2CE] shadow-[inset_0_1px_0_0_#ffffff]' 
                        : 'hover:bg-[rgba(255,255,255,0.3)]'}`}
                    onClick={() => closeApp(app.title)}
                  >
                    <Image
                      src={getIconPath(app.title)}
                      alt={app.title}
                      width={24}
                      height={24}
                      onError={(e) => {
                        // Fallback to a default icon if the specific one doesn't exist
                        (e.target as HTMLImageElement).src = "/icons/default.png";
                      }}
                    />
                    <p className="text-xs text-[#0C3B80] font-medium">{app.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute right-0 flex items-center">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="h-2.5 text-white w-16"
                >
                  <path
                    fill="currentColor"
                    d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"
                  />
                </svg>
                <Image
                  className="w-4 h-4 mr-2"
                  src="/tray/action1.png"
                  alt="Action"
                  width={30}
                  height={30}
                />
                <Image
                  className="w-4 h-4 mr-2"
                  src="/tray/network.png"
                  alt="Network"
                  width={30}
                  height={30}
                />
                <Image
                  className="w-4 h-4 mr-2"
                  src="/tray/audio3.png"
                  alt="Audio"
                  width={30}
                  height={30}
                />
                <ServerClock />
              </div>
            </div>
          </div>
        </div>
      </div>

      {Shutdown && <Alertbox title={"Shutting down pc ..."} />}
      {ShutdowVideo && <ShutdownVideo />}
    </>
  );
}

export default Taskbar;
