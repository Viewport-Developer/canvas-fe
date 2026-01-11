import { create } from "zustand";
import type { Point, Path, Shape } from "../types";

interface CanvasStore {
  paths: Path[];
  currentPath: Path | null;
  shapes: Shape[];
  currentShape: Shape | null;
  pathsToErase: string[];
  shapesToErase: string[];
  zoom: number;
  pan: Point;

  setPaths: (paths: Path[]) => void;
  addPath: (path: Path) => void;
  removePaths: (ids: string[]) => void;

  setCurrentPath: (path: Path | null) => void;
  addCurrentPathPoint: (point: Point) => void;

  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  removeShapes: (ids: string[]) => void;

  setCurrentShape: (shape: Shape | null) => void;
  updateCurrentShape: (endPoint: Point) => void;

  clearPathsToErase: () => void;
  addPathToErase: (id: string) => void;

  clearShapesToErase: () => void;
  addShapeToErase: (id: string) => void;

  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  paths: [],
  currentPath: null,
  shapes: [],
  currentShape: null,
  pathsToErase: [],
  shapesToErase: [],
  zoom: 1,
  pan: { x: 0, y: 0 },

  setPaths: (paths) => set({ paths }),
  addPath: (path) => set((state) => ({ paths: [...state.paths, path] })),
  removePaths: (ids) =>
    set((state) => ({ paths: state.paths.filter((v) => !ids.includes(v.id)) })),

  setCurrentPath: (currentPath) => set({ currentPath }),
  addCurrentPathPoint: (point) =>
    set((state) => {
      if (!state.currentPath) return state;

      return {
        currentPath: {
          ...state.currentPath,
          points: [...state.currentPath.points, point],
        },
      };
    }),

  setShapes: (shapes) => set({ shapes }),
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  removeShapes: (ids) =>
    set((state) => ({
      shapes: state.shapes.filter((v) => !ids.includes(v.id)),
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

  clearPathsToErase: () => set({ pathsToErase: [] }),
  addPathToErase: (id) =>
    set((state) => ({ pathsToErase: [...state.pathsToErase, id] })),

  clearShapesToErase: () => set({ shapesToErase: [] }),
  addShapeToErase: (id) =>
    set((state) => ({ shapesToErase: [...state.shapesToErase, id] })),

  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
}));
