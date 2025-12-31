import { create } from "zustand";
import type { Point, Path } from "../types";

interface CanvasStore {
  paths: Path[];
  currentPath: Path | null;
  pathsToErase: string[];
  zoom: number;
  pan: Point;

  setPaths: (paths: Path[]) => void;
  addPath: (path: Path) => void;
  removePaths: (ids: string[]) => void;

  setCurrentPath: (path: Path | null) => void;
  addCurrentPathPoint: (point: Point) => void;

  clearPathsToErase: () => void;
  addPathToErase: (id: string) => void;

  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  paths: [],
  currentPath: null,
  pathsToErase: [],
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

  clearPathsToErase: () => set({ pathsToErase: [] }),
  addPathToErase: (id) =>
    set((state) => ({ pathsToErase: [...state.pathsToErase, id] })),

  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),
}));
