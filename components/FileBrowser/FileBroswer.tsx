"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import Topbar from "../Browser/Topbar";
import Filenavbar from "./Filenavbar";
import Portfolio from "./Portfolio";

function FileBroswer({
  setIsWindowOpen,

  title,
}: {
  setIsWindowOpen: (isOpen: boolean) => void;

  title: string;
}) {
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

  const handleClose = useCallback(() => {
    setIsWindowOpen(false);
  }, [setIsWindowOpen]);

  const responsiveStyles = {
    top: isSmallScreen ? "5%" : "10%",
    left: isSmallScreen ? "5%" : "20%",
    width: isSmallScreen ? "90%" : "750px",
    height: isSmallScreen ? "90%" : "75%",
    transform: isSmallScreen ? "none" : "translate(145px, -14px)",
  };
  return (
    <>
      <Draggable nodeRef={ref} bounds="parent">
        <div
          ref={ref}
          className="absolute inline-block bg-white rounded-md shadow-lg "
          style={{
            ...responsiveStyles,
            zIndex: 1,
          }}
        >
          <Topbar title={title} onClose={handleClose} />
          <Filenavbar />
          <Portfolio />
        </div>
      </Draggable>
    </>
  );
}

export default FileBroswer;
