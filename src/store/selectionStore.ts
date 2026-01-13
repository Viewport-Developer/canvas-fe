import { create } from "zustand";
import type { Point } from "../types";

interface SelectionStore {
  // 선택된 경로 ID 목록
  selectedPathIds: string[];
  // 선택된 도형 ID 목록
  selectedShapeIds: string[];

  // 드래그 선택 상태
  isDragSelecting: boolean;
  dragStartPoint: Point | null;
  dragEndPoint: Point | null;

  setSelectedPathIds: (ids: string[]) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  addSelectedPathId: (id: string) => void;
  addSelectedShapeId: (id: string) => void;
  clearSelection: () => void;

  // 드래그 선택 상태 관리
  setIsDragSelecting: (isDragSelecting: boolean) => void;
  setDragStartPoint: (point: Point | null) => void;
  setDragEndPoint: (point: Point | null) => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedPathIds: [],
  selectedShapeIds: [],

  isDragSelecting: false,
  dragStartPoint: null,
  dragEndPoint: null,

  setSelectedPathIds: (ids) => set({ selectedPathIds: ids }),

  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),

  addSelectedPathId: (id) => set((state) => ({ selectedPathIds: [...state.selectedPathIds, id] })),

  addSelectedShapeId: (id) => set((state) => ({ selectedShapeIds: [...state.selectedShapeIds, id] })),

  clearSelection: () => set({ selectedPathIds: [], selectedShapeIds: [] }),

  setIsDragSelecting: (isDragSelecting) => set({ isDragSelecting }),
  setDragStartPoint: (dragStartPoint) => set({ dragStartPoint }),
  setDragEndPoint: (dragEndPoint) => set({ dragEndPoint }),
}));
