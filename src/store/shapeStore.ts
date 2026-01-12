import { create } from "zustand";
import type { Point, Shape } from "../types";

// 도형 스토어 인터페이스
interface ShapeStore {
  // 완성된 도형 목록
  shapes: Shape[];
  // 현재 그리는 중인 도형
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
