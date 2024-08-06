"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import Topbar from "../Browser/Topbar";

import Vid from "./Video";

function Videoplayer({
  setIsWindowOpen,
  url,
  title,
  zIndex,
}: {
  setIsWindowOpen: (isOpen: boolean) => void;
  url: string;
  title: string;
  zIndex: number;
}) {
  const handleClose = useCallback(() => {
    setIsWindowOpen(false);
  }, [setIsWindowOpen]);

  const ref = useRef<HTMLDivElement>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const responsiveStyles = {
    top: isSmallScreen ? "5%" : `${10 + zIndex * 2}%`,
    left: isSmallScreen ? "5%" : `${20 + zIndex * 2}%`,
    width: isSmallScreen ? "60%" : "750px",
    height: isSmallScreen ? "50%" : "75%",
    transform: isSmallScreen ? "none" : "translate(145px, -14px)",
  };
  return (
    <>
      <Draggable nodeRef={ref} bounds="parent">
        <div
          ref={ref}
          className="absolute  window active bg-white rounded-md shadow-lg"
          style={{
            ...responsiveStyles,
            zIndex: 1000 + zIndex,
          }}
        >
          <Topbar title={title} onClose={handleClose} />
          <Vid url={url} />
        </div>
      </Draggable>
    </>
  );
}

export default Videoplayer;
