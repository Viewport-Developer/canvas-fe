import { create } from "zustand";

// 지우개 스토어 인터페이스
interface EraserStore {
  // 지울 경로 ID 목록
  pathsToErase: string[];
  // 지울 도형 ID 목록
  shapesToErase: string[];

  clearPathsToErase: () => void;
  addPathToErase: (id: string) => void;
  clearShapesToErase: () => void;
  addShapeToErase: (id: string) => void;
}

export const useEraserStore = create<EraserStore>((set) => ({
  pathsToErase: [],
  shapesToErase: [],

  clearPathsToErase: () => set({ pathsToErase: [] }),

  addPathToErase: (id) =>
    set((state) => {
      if (state.pathsToErase.includes(id)) return state;
      return { pathsToErase: [...state.pathsToErase, id] };
    }),

  clearShapesToErase: () => set({ shapesToErase: [] }),

  addShapeToErase: (id) =>
    set((state) => {
      if (state.shapesToErase.includes(id)) return state;
      return { shapesToErase: [...state.shapesToErase, id] };
    }),
}));
