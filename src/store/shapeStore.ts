import { create } from "zustand";
import type { Point, Shape } from "../types";
import { getGlobalYjsData } from "./yjsStore";

interface ShapeStore {
  shapes: Shape[];
  currentShape: Shape | null;

  setShapes: (shapes: Shape[], skipYjsSync?: boolean) => void;
  addShape: (shape: Shape) => void;
  removeShapes: (ids: string[]) => void;
  setCurrentShape: (shape: Shape | null) => void;
  updateCurrentShape: (endPoint: Point) => void;
}

// y.js에 쓰기 헬퍼 함수
const syncToYjs = (shapes: Shape[]) => {
  const yjsData = getGlobalYjsData();
  if (yjsData?.shapes) {
    const yjsArray = yjsData.shapes.toArray();
    if (JSON.stringify(yjsArray) !== JSON.stringify(shapes)) {
      yjsData.shapes.delete(0, yjsData.shapes.length);
      yjsData.shapes.insert(0, shapes);
    }
  }
};

export const useShapeStore = create<ShapeStore>((set) => ({
  shapes: [],
  currentShape: null,

  setShapes: (shapes, skipYjsSync = false) => {
    set({ shapes });
    if (!skipYjsSync) {
      syncToYjs(shapes);
    }
  },

  addShape: (shape) =>
    set((state) => {
      const newShapes = [...state.shapes, shape];
      syncToYjs(newShapes);
      return { shapes: newShapes };
    }),

  removeShapes: (ids) =>
    set((state) => {
      const newShapes = state.shapes.filter((shape) => !ids.includes(shape.id));
      syncToYjs(newShapes);
      return { shapes: newShapes };
    }),

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
