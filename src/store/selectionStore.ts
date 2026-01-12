import { create } from "zustand";

// 선택 스토어 인터페이스
interface SelectionStore {
  // 선택된 경로 ID 목록
  selectedPathIds: string[];
  // 선택된 도형 ID 목록
  selectedShapeIds: string[];

  setSelectedPathIds: (ids: string[]) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedPathIds: [],
  selectedShapeIds: [],

  setSelectedPathIds: (ids) => set({ selectedPathIds: ids }),

  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),

  clearSelection: () => set({ selectedPathIds: [], selectedShapeIds: [] }),
}));
