import { create } from "zustand";
import type { Tool } from "../types";

interface ToolStore {
  // 현재 선택된 도구
  tool: Tool;
  // 팬 모드 활성화 여부
  isPanning: boolean;

  // 도구 변경
  setTool: (tool: Tool) => void;
  // 팬 상태 변경
  setIsPanning: (isPanning: boolean) => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  tool: "draw",
  isPanning: false,

  setTool: (tool) => set({ tool }),
  setIsPanning: (isPanning) => set({ isPanning }),
}));
