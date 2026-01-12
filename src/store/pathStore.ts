import { create } from "zustand";
import type { Point, Path } from "../types";

// 경로 스토어 인터페이스
interface PathStore {
  // 완성된 경로 목록
  paths: Path[];
  // 현재 그리는 중인 경로
  currentPath: Path | null;

  setPaths: (paths: Path[]) => void;
  addPath: (path: Path) => void;
  removePaths: (ids: string[]) => void;
  setCurrentPath: (path: Path | null) => void;
  addCurrentPathPoint: (point: Point) => void;
}

export const usePathStore = create<PathStore>((set) => ({
  paths: [],
  currentPath: null,

  setPaths: (paths) => set({ paths }),

  addPath: (path) => set((state) => ({ paths: [...state.paths, path] })),

  removePaths: (ids) =>
    set((state) => ({
      paths: state.paths.filter((path) => !ids.includes(path.id)),
    })),

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
}));
