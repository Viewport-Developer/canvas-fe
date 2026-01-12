import { create } from "zustand";
import type { Point } from "../types";

interface ViewportStore {
  // 줌 레벨
  zoom: number;
  // 팬(이동) 오프셋
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
