import { create } from "zustand";
import type { Text } from "../types";
import { getGlobalYjsData } from "./yjsStore";

interface TextStore {
  texts: Text[];

  setTexts: (texts: Text[], skipYjsSync?: boolean) => void;
  addText: (text: Text) => void;
  removeTexts: (ids: string[]) => void;
  updateText: (id: string, content: string) => void;
  updateTextWithBoundingBox: (id: string, content: string, boundingBox: Text["boundingBox"]) => void;
}

// y.js에 쓰기 헬퍼 함수
const syncToYjs = (texts: Text[]) => {
  const yjsData = getGlobalYjsData();
  if (yjsData?.texts) {
    const yjsArray = yjsData.texts.toArray();
    if (JSON.stringify(yjsArray) !== JSON.stringify(texts)) {
      yjsData.texts.delete(0, yjsData.texts.length);
      yjsData.texts.insert(0, texts);
    }
  }
};

export const useTextStore = create<TextStore>((set) => ({
  texts: [],

  setTexts: (texts, skipYjsSync = false) => {
    set({ texts });
    if (!skipYjsSync) {
      syncToYjs(texts);
    }
  },

  addText: (text) =>
    set((state) => {
      const newTexts = [...state.texts, text];
      syncToYjs(newTexts);
      return { texts: newTexts };
    }),

  removeTexts: (ids) =>
    set((state) => {
      const newTexts = state.texts.filter((text) => !ids.includes(text.id));
      syncToYjs(newTexts);
      return { texts: newTexts };
    }),

  updateText: (id, content) =>
    set((state) => {
      const newTexts = state.texts.map((text) => (text.id === id ? { ...text, content } : text));
      syncToYjs(newTexts);
      return { texts: newTexts };
    }),

  updateTextWithBoundingBox: (id, content, boundingBox) =>
    set((state) => {
      const newTexts = state.texts.map((text) => (text.id === id ? { ...text, content, boundingBox } : text));
      syncToYjs(newTexts);
      return { texts: newTexts };
    }),
}));
