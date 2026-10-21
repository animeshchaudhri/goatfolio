"use client";
import React from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { TitleBar, FONT } from "./Chrome";
import type { WindowProps } from "../Desktop/windows";

// Fixed-size Win7 dialog: close-only title bar, grey body, optional right-aligned button footer.
export default function Dialog({
  title, icon, width, height, footer, children, onClose, zIndex, onFocus, minimized, onMinimize,
}: Omit<WindowProps, "app"> & {
  title: string;
  icon?: string;
  width: string;
  height: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DraggableWindow
      cancelSelector=".win7-dialog-body, .win7-dialog-footer"
      zIndex={zIndex}
      width={width}
      height={height}
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      resizable={false}
      className="window active"
    >
      <TitleBar title={title} icon={icon} onClose={onClose} controls="close" />
      <div
        className="win7-dialog-body window-body"
        style={{ flex: 1, minHeight: 0, overflow: "auto", fontFamily: FONT, fontSize: 12, padding: 10 }}
      >
        {children}
      </div>
      {footer && (
        <footer
          className="win7-dialog-footer"
          style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0 }}
        >
          {footer}
        </footer>
      )}
    </DraggableWindow>
  );
}
