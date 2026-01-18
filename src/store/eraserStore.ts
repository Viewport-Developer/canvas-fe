import { create } from "zustand";

interface EraserStore {
  pathsToErase: string[];
  shapesToErase: string[];
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
