import type React from "react";
import Clock from "./Clock";
import Calendar from "./Calendar";
import CpuMeter from "./CpuMeter";
import SlideShow from "./SlideShow";
import type { GadgetKind } from "./GadgetsContext";

// Gadget Gallery entries (in gallery order, which is alphabetical like Win7)

export interface GadgetDef {
  kind: GadgetKind;
  name: string;
  description: string;
  Component: React.ComponentType<{ preview?: boolean }>;
}

export const GADGETS: GadgetDef[] = [
  { kind: "calendar",  name: "Calendar",   Component: Calendar,  description: "Browse the calendar and see today's date at a glance." },
  { kind: "clock",     name: "Clock",      Component: Clock,     description: "See the current time on an analog clock." },
  { kind: "cpu",       name: "CPU Meter",  Component: CpuMeter,  description: "See how much of the computer's processor and memory is in use." },
  { kind: "slideshow", name: "Slide Show", Component: SlideShow, description: "Watch a continuous slide show of your pictures." },
];

export const gadgetDef = (kind: GadgetKind) => GADGETS.find((g) => g.kind === kind)!;
