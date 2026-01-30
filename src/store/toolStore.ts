import { create } from "zustand";
import type { Tool } from "../types";

export type ToolStore = {
  tool: Tool;
  isPanning: boolean;

  setTool: (tool: Tool) => void;
  setIsPanning: (isPanning: boolean) => void;
};

export const useToolStore = create<ToolStore>((set) => ({
  tool: "draw",
  isPanning: false,

  setTool: (tool) => set({ tool }),

  setIsPanning: (isPanning) => set({ isPanning }),
}));
