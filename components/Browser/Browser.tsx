"use client";
import React, { useCallback } from "react";
import Topbar from "./Topbar";
import Iframe from "./Iframe";
import DraggableWindow from "../DraggableWindow/DraggableWindow";

function Browser({
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
    <DraggableWindow cancelSelector=".window-content" zIndex={zIndex} width="750px" height="75vh" onFocus={onFocus} minimized={minimized} onMinimize={onMinimize} className="window active bg-white rounded-md shadow-lg">
      <Topbar title={title} onClose={handleClose} />
      <Iframe url={url} />
    </DraggableWindow>
  );
}

export default React.memo(Browser);
