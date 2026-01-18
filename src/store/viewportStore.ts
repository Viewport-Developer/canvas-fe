import { create } from "zustand";
import type { Point } from "../types";

interface ViewportStore {
  zoom: number;
  pan: Point;

  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
}

export const useViewportStore = create<ViewportStore>((set) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },

  setZoom: (zoom) => set({ zoom }),

  setPan: (pan) => set({ pan }),
}));
