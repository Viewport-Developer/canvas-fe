import { create } from "zustand";
import type { Shape } from "../types";

export type ShapeStore = {
  shapes: Shape[];
  currentShapes: Shape[];

  setShapes: (shapes: Shape[]) => void;
  setCurrentShapes: (currentShapes: Shape[]) => void;
};

export const useShapeStore = create<ShapeStore>((set) => ({
  shapes: [],
  currentShapes: [],

  setShapes: (shapes) => set({ shapes }),

  setCurrentShapes: (currentShapes) => set({ currentShapes }),
}));
