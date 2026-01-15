import { create } from "zustand";
import type { Point } from "../types";

interface SelectionStore {
  // 선택된 경로 ID 목록
  selectedPathIds: string[];
  // 선택된 도형 ID 목록
  selectedShapeIds: string[];
  // 선택된 텍스트 ID 목록
  selectedTextIds: string[];

  // 드래그 선택 상태
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

  // 드래그 선택 상태 관리
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
    set((state) => ({
      selectedPathIds: state.selectedPathIds.includes(id) ? state.selectedPathIds : [...state.selectedPathIds, id],
    })),

  addSelectedShapeId: (id) =>
    set((state) => ({
      selectedShapeIds: state.selectedShapeIds.includes(id) ? state.selectedShapeIds : [...state.selectedShapeIds, id],
    })),

  addSelectedTextId: (id) =>
    set((state) => ({
      selectedTextIds: state.selectedTextIds.includes(id) ? state.selectedTextIds : [...state.selectedTextIds, id],
    })),

  clearSelection: () => set({ selectedPathIds: [], selectedShapeIds: [], selectedTextIds: [] }),

  setIsDragSelecting: (isDragSelecting) => set({ isDragSelecting }),
  setDragStartPoint: (dragStartPoint) => set({ dragStartPoint }),
  setDragEndPoint: (dragEndPoint) => set({ dragEndPoint }),
}));
