"use client";
import React from "react";
import Topbar from "../Browser/Topbar";
import TypingTextarea from "./Typing";
import DraggableWindow from "../DraggableWindow/DraggableWindow";

function Notepad({ handleClose, zIndex, onFocus, minimized, onMinimize }: { handleClose: () => void; zIndex: number; onFocus?: () => void; minimized?: boolean; onMinimize?: () => void }) {
  return (
    <DraggableWindow
      cancelSelector=".window-body, .can-hover"
      zIndex={zIndex}
      zIndexBase={100}
      maxWidth="650px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="inset-0 bg-white rounded-md"
    >
      <Topbar title="Notepad" onClose={handleClose} />
      <div className="rounded-md has-space">
        <ul role="menubar" className="can-hover">
          <li role="menuitem" tabIndex={0} aria-haspopup="true">
            File
            <ul role="menu">
              <li role="menuitem"><a href="#menubar">Open <span>Ctrl+O</span></a></li>
              <li role="menuitem"><a href="#menubar">Save <span>Ctrl+S</span></a></li>
              <li role="menuitem" className="has-divider"><a href="#menubar">Save As... <span>Ctrl+Shift+S</span></a></li>
              <li role="menuitem"><a href="#menubar">Exit</a></li>
            </ul>
          </li>
          <li role="menuitem" tabIndex={0} aria-haspopup="true">
            Edit
            <ul role="menu">
              <li role="menuitem"><a href="#menubar">Undo</a></li>
              <li role="menuitem"><a href="#menubar">Copy</a></li>
              <li role="menuitem"><a href="#menubar">Cut</a></li>
              <li role="menuitem" className="has-divider"><a href="#menubar">Paste</a></li>
              <li role="menuitem"><a href="#menubar">Delete</a></li>
              <li role="menuitem"><a href="#menubar">Find...</a></li>
              <li role="menuitem"><a href="#menubar">Replace...</a></li>
              <li role="menuitem"><a href="#menubar">Go to...</a></li>
            </ul>
          </li>
          <li role="menuitem" tabIndex={0} aria-haspopup="true">
            View
            <ul role="menu">
              <li role="menuitem" tabIndex={0} aria-haspopup="true">
                Zoom
                <ul role="menu">
                  <li role="menuitem"><button>Zoom In</button></li>
                  <li role="menuitem"><button>Zoom Out</button></li>
                </ul>
              </li>
              <li role="menuitem"><a href="#menubar">Status Bar</a></li>
            </ul>
          </li>
          <li role="menuitem" tabIndex={0} aria-haspopup="true">
            Help
            <ul role="menu">
              <li role="menuitem"><a href="#menubar">View Help</a></li>
              <li role="menuitem"><a href="#menubar">About</a></li>
            </ul>
          </li>
        </ul>
        <TypingTextarea />
      </div>
    </DraggableWindow>
  );
}

export default Notepad;
