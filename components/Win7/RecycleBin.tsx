"use client";
import React, { useState } from "react";
import DraggableWindow from "../DraggableWindow/DraggableWindow";
import { useDesktop } from "../Desktop/DesktopContext";
import type { WindowProps } from "../Desktop/windows";
import { useWindowSize } from "../../hooks/useWindowSize";
import { EXPLORER_CANCEL, TitleBar, AddressBar, CommandBar, NavPane, ExplorerBody, DetailsPane, StatusBar, type ViewMode } from "./Chrome";
import { ItemsView, imgIcon, type Column } from "./FileView";
import { locationApp, openNavLocation } from "./Library";
import { EXPLORER_ICONS as E } from "./explorerIcons";

// Win7 Recycle Bin — always empty ("There's nothing to delete!")

const COLUMNS: Column[] = [
  { label: "Name",              width: 200, value: (i) => i.name },
  { label: "Original Location", width: 170, value: (i) => i.columns?.["Original Location"] ?? "" },
  { label: "Date Deleted",      width: 140, value: (i) => i.columns?.["Date Deleted"] ?? "" },
  { label: "Size",              width: 70,  value: (i) => i.size ?? "" },
  { label: "Item type",         width: 110, value: (i) => i.type },
];

export default function RecycleBin({ onClose, zIndex, onFocus, minimized, onMinimize }: WindowProps) {
  const { openApp } = useDesktop();
  const small = useWindowSize();
  const [view, setView] = useState<ViewMode>("details");
  const [showNav, setShowNav] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

  return (
    <DraggableWindow
      cancelSelector={EXPLORER_CANCEL}
      zIndex={zIndex}
      width="760px"
      height="480px"
      onFocus={onFocus}
      minimized={minimized}
      onMinimize={onMinimize}
      className="window active"
    >
      <TitleBar title="" onClose={onClose} />
      <AddressBar
        icon={E.recycleBin}
        path={["Recycle Bin"]}
        searchPlaceholder={small ? undefined : "Search Recycle Bin"}
        onCrumb={(i) => i < 0 && openApp(locationApp("Desktop"))}
      />
      <ExplorerBody>
        <CommandBar
          view={view}
          onViewChange={setView}
          commands={[
            {
              label: "Organize",
              menu: [
                { label: "Cut", disabled: true }, { label: "Copy", disabled: true }, { label: "Paste", disabled: true },
                { label: "Undo", disabled: true }, { label: "Redo", disabled: true, divider: true },
                { label: "Details pane", checked: showDetails, onClick: () => setShowDetails((v) => !v) },
                { label: "Navigation pane", checked: showNav, onClick: () => setShowNav((v) => !v), divider: true },
                { label: "Close", onClick: onClose },
              ],
            },
            { label: "Empty the Recycle Bin", disabled: true },
            { label: "Restore all items", disabled: true },
          ]}
        />
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          {showNav && !small && <NavPane navSel="" onSelect={(label) => openNavLocation(openApp, label)} />}
          <ItemsView items={[]} view={view} selected={null} onSelect={() => {}} columns={COLUMNS} />
        </div>
        {showDetails && <DetailsPane icon={imgIcon(E.recycleBin)(48)} title="0 items" />}
        <StatusBar left="0 items" />
      </ExplorerBody>
    </DraggableWindow>
  );
}
