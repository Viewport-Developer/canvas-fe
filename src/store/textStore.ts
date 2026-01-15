import { create } from "zustand";
import type { Text } from "../types";

interface TextStore {
  // 완성된 텍스트 목록
  texts: Text[];

  setTexts: (texts: Text[]) => void;
  addText: (text: Text) => void;
  removeTexts: (ids: string[]) => void;
  updateText: (id: string, content: string) => void;
  updateTextWithBoundingBox: (id: string, content: string, boundingBox: Text["boundingBox"]) => void;
}

export const useTextStore = create<TextStore>((set) => ({
  texts: [],

  setTexts: (texts) => set({ texts }),

  addText: (text) => set((state) => ({ texts: [...state.texts, text] })),

  removeTexts: (ids) =>
    set((state) => ({
      texts: state.texts.filter((text) => !ids.includes(text.id)),
    })),

  updateText: (id, content) =>
    set((state) => ({
      texts: state.texts.map((text) => (text.id === id ? { ...text, content } : text)),
    })),

  updateTextWithBoundingBox: (id, content, boundingBox) =>
    set((state) => ({
      texts: state.texts.map((text) => (text.id === id ? { ...text, content, boundingBox } : text)),
    })),
}));
