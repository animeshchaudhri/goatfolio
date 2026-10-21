"use client";
import React from "react";
import type { App } from "./apps";
import Browser from "../Browser/Browser";
import FileBrowser from "../FileBrowser/FileBroswer";
import Notepad from "../Notepad/Notepad";
import Videoplayer from "../Videoplayer/Videoplayer";
import MyComputer from "../MyComputer/MyComputer";
import Library from "../Win7/Library";
import RecycleBin from "../Win7/RecycleBin";
import Games from "../Win7/Games";
import DevicesPrinters from "../Win7/DevicesPrinters";
import ControlPanel from "../Win7/ControlPanel";
import Personalization from "../Win7/Personalization";
import ScreenResolution from "../Win7/ScreenResolution";
import DefaultPrograms from "../Win7/DefaultPrograms";
import HelpSupport from "../Win7/HelpSupport";
import GettingStarted from "../Win7/GettingStarted";
import SoundDialog from "../Win7/SoundDialog";
import Messenger from "../Win7/Messenger";
import Gadgets from "../Win7/Gadgets";

export interface WindowProps {
  app: App;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  minimized: boolean;
  onMinimize: () => void;
}

// App `type` → window component
export const WINDOWS: Record<string, React.ComponentType<WindowProps>> = {
  browser:     ({ app, onClose, ...p }) => <Browser setIsWindowOpen={onClose} url={app.url} title={app.title} {...p} />,
  fileBrowser: ({ app, onClose, ...p }) => <FileBrowser setIsWindowOpen={onClose} title={app.title} {...p} />,
  Notepad:     ({ app, onClose, ...p }) => <Notepad handleClose={onClose} {...p} />,
  Videoplayer: ({ app, onClose, ...p }) => <Videoplayer setIsWindowOpen={onClose} url={app.url} title={app.title} {...p} />,
  myComputer:  ({ app, onClose, ...p }) => <MyComputer setIsWindowOpen={onClose} {...p} />,
  library:          Library,
  recycleBin:       RecycleBin,
  games:            Games,
  devicesPrinters:  DevicesPrinters,
  controlPanel:     ControlPanel,
  personalization:  Personalization,
  screenResolution: ScreenResolution,
  defaultPrograms:  DefaultPrograms,
  helpSupport:      HelpSupport,
  gettingStarted:   GettingStarted,
  sound:            SoundDialog,
  chat:             Messenger,
  gadgets:          Gadgets,
};
