"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Desktop gadgets: which ones are on the desktop, where (anchored to the right edge, like Win7),
// and whether View ▸ Show desktop gadgets is on. Persisted in localStorage.

export type GadgetKind = "clock" | "calendar" | "cpu" | "slideshow";

export const GADGET_SIZE: Record<GadgetKind, { w: number; h: number }> = {
  clock:     { w: 130, h: 130 },
  calendar:  { w: 130, h: 134 },
  cpu:       { w: 158, h: 100 },
  slideshow: { w: 130, h: 98 },
};

export interface GadgetInstance { id: string; kind: GadgetKind; right: number; top: number }

export interface GadgetsContextValue {
  gadgets: GadgetInstance[];
  addGadget: (kind: GadgetKind) => void;
  removeGadget: (id: string) => void;
  moveGadget: (id: string, right: number, top: number) => void;
  showGadgets: boolean;
  setShowGadgets: (v: boolean) => void;
}

export const GadgetsContext = createContext<GadgetsContextValue>({
  gadgets: [],
  addGadget: () => {},
  removeGadget: () => {},
  moveGadget: () => {},
  showGadgets: true,
  setShowGadgets: () => {},
});

export function useGadgets() {
  return useContext(GadgetsContext);
}

const EDGE = 14;
const GAP = 10;

export function useGadgetsState(): GadgetsContextValue {
  const [gadgets, setGadgets] = useState<GadgetInstance[]>([]);
  const [showGadgets, setShowState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("desktop.gadgets") ?? "[]");
      if (Array.isArray(saved)) setGadgets(saved.filter((g) => g && g.kind in GADGET_SIZE));
    } catch { /* corrupt storage: start empty */ }
    setShowState(localStorage.getItem("desktop.showGadgets") !== "false");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("desktop.gadgets", JSON.stringify(gadgets));
  }, [gadgets, loaded]);

  const addGadget = useCallback((kind: GadgetKind) => {
    const { w, h } = GADGET_SIZE[kind];
    setGadgets((prev) => {
      // Stack down the right edge below whatever is already docked there
      let top = EDGE;
      for (const g of [...prev].sort((a, b) => a.top - b.top)) {
        const s = GADGET_SIZE[g.kind];
        const overlapsColumn = g.right < EDGE + w && g.right + s.w > EDGE;
        if (overlapsColumn && g.top < top + h + GAP && g.top + s.h + GAP > top) top = g.top + s.h + GAP;
      }
      if (top + h > window.innerHeight - 40) top = EDGE + (prev.length % 5) * 18;
      return [...prev, { id: `${kind}-${Date.now()}`, kind, right: EDGE, top }];
    });
    setShowState(true);
    localStorage.setItem("desktop.showGadgets", "true");
  }, []);

  const removeGadget = useCallback((id: string) => {
    setGadgets((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const moveGadget = useCallback((id: string, right: number, top: number) => {
    setGadgets((prev) => prev.map((g) => (g.id === id ? { ...g, right, top } : g)));
  }, []);

  const setShowGadgets = useCallback((v: boolean) => {
    setShowState(v);
    localStorage.setItem("desktop.showGadgets", String(v));
  }, []);

  return useMemo(
    () => ({ gadgets, addGadget, removeGadget, moveGadget, showGadgets, setShowGadgets }),
    [gadgets, addGadget, removeGadget, moveGadget, showGadgets, setShowGadgets],
  );
}
