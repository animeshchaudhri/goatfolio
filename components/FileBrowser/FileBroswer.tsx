"use client";
import React, { useCallback } from "react";
import Portfolio from "./Portfolio";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { EXPLORER_CANCEL } from "../Win7/Chrome";

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
      cancelSelector={EXPLORER_CANCEL}
      zIndex={zIndex}
      width="780px"
      height="520px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <Portfolio title={title} onClose={handleClose} />
    </DraggableWindow>
  );
}

export default FileBrowser;
