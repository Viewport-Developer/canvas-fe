import { create } from "zustand";

interface EraserStore {
  // 지울 경로 ID 목록
  pathsToErase: string[];
  // 지울 도형 ID 목록
  shapesToErase: string[];
  // 지울 텍스트 ID 목록
  textsToErase: string[];

  clearPathsToErase: () => void;
  addPathToErase: (id: string) => void;
  clearShapesToErase: () => void;
  addShapeToErase: (id: string) => void;
  clearTextsToErase: () => void;
  addTextToErase: (id: string) => void;
}

export const useEraserStore = create<EraserStore>((set) => ({
  pathsToErase: [],
  shapesToErase: [],
  textsToErase: [],

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

  clearTextsToErase: () => set({ textsToErase: [] }),

  addTextToErase: (id) =>
    set((state) => {
      if (state.textsToErase.includes(id)) return state;
      return { textsToErase: [...state.textsToErase, id] };
    }),
}));
