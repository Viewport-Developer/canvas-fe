import { create } from "zustand";
import type { Path } from "../types";

export type PathStore = {
  paths: Path[];
  currentPaths: Path[];

  setPaths: (paths: Path[]) => void;
  setCurrentPaths: (currentPaths: Path[]) => void;
};

export const usePathStore = create<PathStore>((set) => ({
  paths: [],
  currentPaths: [],

  setPaths: (paths) => set({ paths }),

  setCurrentPaths: (currentPaths) => set({ currentPaths }),
}));
