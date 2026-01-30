import { create } from "zustand";
import type { Point } from "../types";

export type SelectionStore = {
  selectedPaths: Set<string>;
  selectedShapes: Set<string>;
  selectedTexts: Set<string>;
  isDragSelecting: boolean;
  dragStartPoint: Point | null;
  dragEndPoint: Point | null;

  addSelected: (type: "path" | "shape" | "text", id: string) => void;
  clearSelection: () => void;
  setIsDragSelecting: (isDragSelecting: boolean) => void;
  setDragStartPoint: (point: Point | null) => void;
  setDragEndPoint: (point: Point | null) => void;
};

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedPaths: new Set<string>(),
  selectedShapes: new Set<string>(),
  selectedTexts: new Set<string>(),
  isDragSelecting: false,
  dragStartPoint: null,
  dragEndPoint: null,

  addSelected: (type: "path" | "shape" | "text", id: string) =>
    set((state) => {
      if (type === "path") {
        if (state.selectedPaths.has(id)) return state;
        return { selectedPaths: new Set([...state.selectedPaths, id]) };
      }
      if (type === "shape") {
        if (state.selectedShapes.has(id)) return state;
        return { selectedShapes: new Set([...state.selectedShapes, id]) };
      }
      if (type === "text") {
        if (state.selectedTexts.has(id)) return state;
        return { selectedTexts: new Set([...state.selectedTexts, id]) };
      }
      return state;
    }),

  clearSelection: () =>
    set({ selectedPaths: new Set<string>(), selectedShapes: new Set<string>(), selectedTexts: new Set<string>() }),

  setIsDragSelecting: (isDragSelecting) => set({ isDragSelecting }),

  setDragStartPoint: (dragStartPoint) => set({ dragStartPoint }),

  setDragEndPoint: (dragEndPoint) => set({ dragEndPoint }),
}));
