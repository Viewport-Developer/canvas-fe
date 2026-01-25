import { create } from "zustand";
import type { Point, Path } from "../types";
import { getGlobalYjsData } from "./yjsStore";

interface PathStore {
  paths: Path[];
  currentPath: Path | null;

  setPaths: (paths: Path[], skipYjsSync?: boolean) => void;
  addPath: (path: Path) => void;
  removePaths: (ids: string[]) => void;
  setCurrentPath: (path: Path | null) => void;
  addCurrentPathPoint: (point: Point) => void;
}

// y.js에 쓰기 헬퍼 함수
const syncToYjs = (paths: Path[]) => {
  const yjsData = getGlobalYjsData();
  if (yjsData?.paths) {
    const yjsArray = yjsData.paths.toArray();
    // 무한 루프 방지: y.js와 Zustand가 다를 때만 업데이트
    if (JSON.stringify(yjsArray) !== JSON.stringify(paths)) {
      yjsData.paths.delete(0, yjsData.paths.length);
      yjsData.paths.insert(0, paths);
    }
  }
};

export const usePathStore = create<PathStore>((set) => ({
  paths: [],
  currentPath: null,

  setPaths: (paths, skipYjsSync = false) => {
    set({ paths });
    if (!skipYjsSync) {
      syncToYjs(paths);
    }
  },

  addPath: (path) =>
    set((state) => {
      const newPaths = [...state.paths, path];
      syncToYjs(newPaths);
      return { paths: newPaths };
    }),

  removePaths: (ids) =>
    set((state) => {
      const newPaths = state.paths.filter((path) => !ids.includes(path.id));
      syncToYjs(newPaths);
      return { paths: newPaths };
    }),

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
