"use client";
import React, { useCallback } from "react";
import Filenavbar from "./Filenavbar";
import Portfolio from "./Portfolio";
import Topbar from "./Navigation";
import DraggableWindow from "../DraggableWindow/DraggableWindow";

function FileBrowser({
  setIsWindowOpen,
  title,
  zIndex,
  onFocus,
  minimized,
  onMinimize,
}: {
  setIsWindowOpen: (isOpen: boolean) => void;
  title: string;
  zIndex?: number;
  onFocus?: () => void;
  minimized?: boolean;
  onMinimize?: () => void;
}) {
  const handleClose = useCallback(() => setIsWindowOpen(false), [setIsWindowOpen]);

  return (
    <DraggableWindow
      cancelSelector=".window-body"
      zIndex={zIndex}
      maxWidth="820px"
      maxHeight="80vh"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active rounded-md shadow-lg bg-[#805ba5]"
    >
      <Topbar title={title} onClose={handleClose} />
      <div className="window-body has-space" style={{ overflowY: "auto" }}>
        <Filenavbar />
        <Portfolio />
      </div>
    </DraggableWindow>
  );
}

export default FileBrowser;
