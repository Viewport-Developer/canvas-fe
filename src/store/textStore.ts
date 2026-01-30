import { create } from "zustand";
import type { Text } from "../types";

export type TextStore = {
  texts: Text[];
  currentTexts: Text[];

  setTexts: (texts: Text[]) => void;
  setCurrentTexts: (currentTexts: Text[]) => void;
};

export const useTextStore = create<TextStore>((set) => ({
  texts: [],
  currentTexts: [],

  setTexts: (texts) => set({ texts }),

  setCurrentTexts: (currentTexts) => set({ currentTexts }),
}));
