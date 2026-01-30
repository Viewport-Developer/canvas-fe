import { create } from "zustand";

export type EraserStore = {
  pathsToErase: Set<string>;
  shapesToErase: Set<string>;
  textsToErase: Set<string>;

  clearToErase: () => void;
  addToErase: (type: "path" | "shape" | "text", id: string) => void;
};

export const useEraserStore = create<EraserStore>((set) => ({
  pathsToErase: new Set<string>(),
  shapesToErase: new Set<string>(),
  textsToErase: new Set<string>(),

  clearToErase: () =>
    set({
      pathsToErase: new Set<string>(),
      shapesToErase: new Set<string>(),
      textsToErase: new Set<string>(),
    }),

  addToErase: (type, id) =>
    set((state) => {
      if (type === "path") {
        if (state.pathsToErase.has(id)) return state;
        return { pathsToErase: new Set([...state.pathsToErase, id]) };
      }
      if (type === "shape") {
        if (state.shapesToErase.has(id)) return state;
        return { shapesToErase: new Set([...state.shapesToErase, id]) };
      }
      if (type === "text") {
        if (state.textsToErase.has(id)) return state;
        return { textsToErase: new Set([...state.textsToErase, id]) };
      }
      return state;
    }),
}));
