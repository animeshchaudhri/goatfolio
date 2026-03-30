"use client";
import React, { useCallback } from "react";
import Topbar from "../Browser/Topbar";
import Vid from "./Video";
import DraggableWindow from "../DraggableWindow/DraggableWindow";

function Videoplayer({
  setIsWindowOpen,
  url,
  title,
  zIndex,
  onFocus,
  minimized,
  onMinimize,
}: {
  setIsWindowOpen: (isOpen: boolean) => void;
  url: string;
  title: string;
  zIndex: number;
  onFocus?: () => void;
  minimized?: boolean;
  onMinimize?: () => void;
}) {
  const handleClose = useCallback(() => setIsWindowOpen(false), [setIsWindowOpen]);

  return (
    <DraggableWindow
      cancelSelector=".video-content"
      zIndex={zIndex}
      width="600px"
      height="400px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active bg-white rounded-md shadow-lg"
    >
      <Topbar title={title} onClose={handleClose} />
      <Vid url={url} />
    </DraggableWindow>
  );
}

export default Videoplayer;
