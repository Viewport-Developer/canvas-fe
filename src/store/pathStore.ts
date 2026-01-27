import { create } from "zustand";
import type { Point, Path } from "../types";
import { getGlobalYjsData, getGlobalClientId, type CurrentPath } from "./yjsStore";

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

  setCurrentPath: (currentPath) => {
    const yjsData = getGlobalYjsData();
    const clientId = getGlobalClientId();
    
    if (yjsData?.currentPaths && clientId !== null) {
      // 기존 currentPath 제거
      const currentPaths = yjsData.currentPaths.toArray();
      const existingIndex = currentPaths.findIndex((cp) => cp.clientId === clientId);
      if (existingIndex !== -1) {
        yjsData.currentPaths.delete(existingIndex, 1);
      }
      
      // 새 currentPath 추가
      if (currentPath) {
        yjsData.currentPaths.push([{ clientId, path: currentPath }]);
      }
    }
    
    set({ currentPath });
  },

  addCurrentPathPoint: (point) =>
    set((state) => {
      if (!state.currentPath) return state;
      
      const updatedPath = {
        ...state.currentPath,
        points: [...state.currentPath.points, point],
      };
      
      // y.js에 실시간 동기화
      const yjsData = getGlobalYjsData();
      const clientId = getGlobalClientId();
      
      if (yjsData?.currentPaths && clientId !== null) {
        const currentPaths = yjsData.currentPaths.toArray();
        const existingIndex = currentPaths.findIndex((cp) => cp.clientId === clientId);
        
        if (existingIndex !== -1) {
          // 기존 항목 업데이트
          yjsData.currentPaths.delete(existingIndex, 1);
          yjsData.currentPaths.insert(existingIndex, [{ clientId, path: updatedPath }]);
        } else {
          // 새로 추가
          yjsData.currentPaths.push([{ clientId, path: updatedPath }]);
        }
      }
      
      return { currentPath: updatedPath };
    }),
}));
