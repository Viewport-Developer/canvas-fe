import { create } from "zustand";
import type { Point } from "../types";

interface SelectionStore {
  selectedPathIds: string[];
  selectedShapeIds: string[];
  selectedTextIds: string[];

  // 드래그 상태
  isDragSelecting: boolean;
  dragStartPoint: Point | null;
  dragEndPoint: Point | null;

  setSelectedPathIds: (ids: string[]) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  setSelectedTextIds: (ids: string[]) => void;
  addSelectedPathId: (id: string) => void;
  addSelectedShapeId: (id: string) => void;
  addSelectedTextId: (id: string) => void;
  clearSelection: () => void;

  setIsDragSelecting: (isDragSelecting: boolean) => void;
  setDragStartPoint: (point: Point | null) => void;
  setDragEndPoint: (point: Point | null) => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedPathIds: [],
  selectedShapeIds: [],
  selectedTextIds: [],

  isDragSelecting: false,
  dragStartPoint: null,
  dragEndPoint: null,

  setSelectedPathIds: (ids) => set({ selectedPathIds: ids }),

  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),

  setSelectedTextIds: (ids) => set({ selectedTextIds: ids }),

  addSelectedPathId: (id) =>
    set((state) => {
      if (state.selectedPathIds.includes(id)) return state;

      return { selectedPathIds: [...state.selectedPathIds, id] };
    }),

  addSelectedShapeId: (id) =>
    set((state) => {
      if (state.selectedShapeIds.includes(id)) return state;

      return { selectedShapeIds: [...state.selectedShapeIds, id] };
    }),

  addSelectedTextId: (id) =>
    set((state) => {
      if (state.selectedTextIds.includes(id)) return state;

      return { selectedTextIds: [...state.selectedTextIds, id] };
    }),

  clearSelection: () => set({ selectedPathIds: [], selectedShapeIds: [], selectedTextIds: [] }),

  setIsDragSelecting: (isDragSelecting) => set({ isDragSelecting }),
  setDragStartPoint: (dragStartPoint) => set({ dragStartPoint }),
  setDragEndPoint: (dragEndPoint) => set({ dragEndPoint }),
}));
