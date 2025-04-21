"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import Topbar from "./Topbar";
import Draggable from "react-draggable";
import Iframe from "./Iframe";

function Browser({
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
    width: isSmallScreen ? "90%" : "750px",
    height: isSmallScreen ? "90%" : "75%",
    transform: isSmallScreen ? "none" : "translate(145px, -14px)",
  };  return (
    <Draggable 
      nodeRef={ref} 
      bounds="parent"
      defaultClassName=""
      defaultClassNameDragging=""
      defaultClassNameDragged=""
      cancel=".window-content"
      scale={1}
      positionOffset={{ x: 0, y: 0 }}
    >
      <div
        ref={ref}
        className="absolute inline-block window active bg-white rounded-md shadow-lg"
        style={{
          ...responsiveStyles,
          zIndex: 1000 + zIndex,
        }}
      >
        <Topbar title={title} onClose={handleClose} />
        <Iframe url={url} />
      </div>
    </Draggable>
  );
}

export default React.memo(Browser);
