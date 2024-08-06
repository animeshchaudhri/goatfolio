"use client";

import Topbar from "../Browser/Topbar";
import React, { useRef, useState, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import TypingTextarea from "./Typing";
function Notepad({
  handleClose,
  zIndex,
}: {
  handleClose: () => void;
  zIndex: number;
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

  const responsiveStyles = {
    top: isSmallScreen ? "5%" : "10%",
    left: isSmallScreen ? "5%" : "20%",
    width: isSmallScreen ? "90%" : "750px",
    height: isSmallScreen ? "60%" : "75%",
    transform: isSmallScreen ? "none" : "translate(145px, -14px)",
  };
  return (
    <>
      <Draggable nodeRef={ref} bounds="parent">
        <div
          ref={ref}
          className="absolute inset-0 bg-white rounded-md  "
          style={{
            ...responsiveStyles,
            zIndex: 100 + zIndex,
          }}
        >
          <Topbar title={"Notepad"} onClose={handleClose} />
          <div className="rounded-md has-space">
            <ul role="menubar" className="can-hover">
              <li role="menuitem" tabIndex={0} aria-haspopup="true">
                File
                <ul role="menu">
                  <li role="menuitem">
                    <a href="#menubar">
                      Open <span>Ctrl+O</span>
                    </a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">
                      Save <span>Ctrl+S</span>
                    </a>
                  </li>
                  <li role="menuitem" className="has-divider">
                    <a href="#menubar">
                      Save As... <span>Ctrl+Shift+S</span>
                    </a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Exit</a>
                  </li>
                </ul>
              </li>
              <li role="menuitem" tabIndex={0} aria-haspopup="true">
                Edit
                <ul role="menu">
                  <li role="menuitem">
                    <a href="#menubar">Undo</a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Copy</a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Cut</a>
                  </li>
                  <li role="menuitem" className="has-divider">
                    <a href="#menubar">Paste</a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Delete</a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Find...</a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Replace...</a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Go to...</a>
                  </li>
                </ul>
              </li>
              <li role="menuitem" tabIndex={0} aria-haspopup="true">
                View
                <ul role="menu">
                  <li role="menuitem" tabIndex={0} aria-haspopup="true">
                    Zoom
                    <ul role="menu">
                      <li role="menuitem">
                        <button>Zoom In</button>
                      </li>
                      <li role="menuitem">
                        <button>Zoom Out</button>
                      </li>
                    </ul>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">Status Bar</a>
                  </li>
                </ul>
              </li>
              <li role="menuitem" tabIndex={0} aria-haspopup="true">
                Help
                <ul role="menu">
                  <li role="menuitem">
                    <a href="#menubar">View Help</a>
                  </li>
                  <li role="menuitem">
                    <a href="#menubar">About</a>
                  </li>
                </ul>
              </li>
            </ul>
            <TypingTextarea />
          </div>
        </div>
      </Draggable>
    </>
  );
}

export default Notepad;
