"use client";
import React, { useEffect, useState } from "react";
import DesktopIcon from "../DesktopIcons/DesktopIcons";
import RightClick from "../Navigation/RightClick";
import Taskbar from "../Navigation/Taskbar";
import Browser from "../Browser/Browser";
import "7.css/dist/7.css";
import FileBroswer from "../FileBrowser/FileBroswer";
import { desktopIcons } from "../Icons";
import Notepad from "../Notepad/Notepad";
import Videoplayer from "../Videoplayer/Videoplayer";

function Desktop() {
  const [rightClickMenu, setRightClickMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [openApps, setOpenApps] = useState<
    Array<{ title: string; url: string; type: string }>
  >([]);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setRightClickMenu({ x: event.clientX, y: event.clientY });
  };

  const iconClicked = (title: string) => {
    const urls: { [key: string]: string } = {
      Internet: "https://www.google.com/?igu=1",
      Twitter: "https://animeshport.netlify.app/",
      Doom: "https://danihre.github.io/jsdoom/",
    };

    if (title in urls) {
      const url = urls[title];
      setOpenApps((prev) => [...prev, { title, url, type: "browser" }]);
    } else if (title === "My Projects") {
      setOpenApps((prev) => [...prev, { title, url: "", type: "fileBrowser" }]);
    }

    if (title === "My Resume") {
      window.open("/Animesh_Chaudhri_Resume.pdf");
    }
    if (title === "Github") {
      window.open("https://github.com/animeshchaudhri");
    }
    if (title === "LinkedIn") {
      window.open("https://www.linkedin.com/in/animeshchaudhri", "_blank");
    }
    if (title === "Recycle Bin") {
      alert("Uca ?! 😂");
    }

    console.log(`${title} was clicked`);
  };

  const handleClick = () => {
    if (rightClickMenu) {
      setRightClickMenu(null);
    }
  };

  const closeApp = (title: string) => {
    setOpenApps((prev) => prev.filter((app) => app.title !== title));
  };

  const addApp = (newApp: { title: string; url: string; type: string }) => {
    setOpenApps((prev) => {
      if (!prev.some((app) => app.title === newApp.title)) {
        return [...prev, newApp];
      }
      return prev;
    });
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <div
        className="absolute inset-0 z-100 overflow-hidden bg-[url('/images/wallpaper2.jpg')] bg-center bg-cover bg-no-repeat"
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {desktopIcons.map((icon, index) => (
          <DesktopIcon
            key={index}
            title={icon.title}
            img={icon.img}
            index={index}
            maxIconsPerColumn={6}
            doubleClick={() => iconClicked(icon.title)}
          />
        ))}

        <Taskbar openApps={openApps} closeApp={closeApp} addApp={addApp} />
        {rightClickMenu && (
          <div
            style={{
              position: "absolute",
              top: rightClickMenu.y,
              left: rightClickMenu.x,
              zIndex: 1000,
            }}
          >
            <RightClick />
          </div>
        )}
        {openApps.map((app, index) =>
          app.type === "browser" ? (
            <Browser
              key={index}
              setIsWindowOpen={() => closeApp(app.title)}
              url={app.url}
              title={app.title}
              zIndex={index}
            />
          ) : app.type === "fileBrowser" ? (
            <FileBroswer
              key={index}
              setIsWindowOpen={() => closeApp(app.title)}
              title={app.title}
            />
          ) : app.type === "Notepad" ? (
            <Notepad
              key={index}
              handleClose={() => closeApp(app.title)}
              zIndex={index}
            />
          ) : app.type === "Videoplayer" ? (
            <Videoplayer
              key={index}
              setIsWindowOpen={() => closeApp(app.title)}
              url={app.url}
              title={app.title}
              zIndex={index}
            />
          ) : (
            <div key={index}>Unknown app type</div>
          )
        )}
      </div>
    </>
  );
}

export default Desktop;
