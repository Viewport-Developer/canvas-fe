import { create } from "zustand";
import type { Point, Shape } from "../types";

interface ShapeStore {
  shapes: Shape[];
  currentShape: Shape | null;

  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  removeShapes: (ids: string[]) => void;
  setCurrentShape: (shape: Shape | null) => void;
  updateCurrentShape: (endPoint: Point) => void;
}

export const useShapeStore = create<ShapeStore>((set) => ({
  shapes: [],
  currentShape: null,

  setShapes: (shapes) => set({ shapes }),

  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),

  removeShapes: (ids) =>
    set((state) => ({
      shapes: state.shapes.filter((shape) => !ids.includes(shape.id)),
    })),

  setCurrentShape: (currentShape) => set({ currentShape }),

  updateCurrentShape: (endPoint) =>
    set((state) => {
      if (!state.currentShape) return state;
      
      return {
        currentShape: {
          ...state.currentShape,
          endPoint,
        },
      };
    }),
}));
