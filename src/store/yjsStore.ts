import { create } from "zustand";
import * as Y from "yjs";
import type { Path, Shape, Text, YjsCanvasData, RemoteCursor, AwarenessLike } from "../types";

type YjsConnectionStore = {
  yjsData: YjsCanvasData | null;
  awareness: AwarenessLike | null;
  clientId: number | null;
  remoteCursors: Map<number, RemoteCursor>;

  setYjsData: (data: YjsCanvasData | null) => void;
  setAwareness: (awareness: AwarenessLike | null) => void;
  setClientId: (clientId: number | null) => void;
  setRemoteCursors: (cursors: Map<number, RemoteCursor>) => void;
  updateCursorPosition: (position: { x: number; y: number } | null) => void;
  resetConnection: () => void;
};

export const useYjsConnectionStore = create<YjsConnectionStore>((set, get) => ({
  yjsData: null,
  awareness: null,
  clientId: null,
  remoteCursors: new Map(),

  setYjsData: (yjsData) => set({ yjsData }),

  setAwareness: (awareness) => set({ awareness }),

  setClientId: (clientId) => set({ clientId }),

  setRemoteCursors: (remoteCursors) => set({ remoteCursors }),

  updateCursorPosition: (position) => {
    get().awareness?.setLocalStateField("cursor", position);
  },

  resetConnection: () => set({ yjsData: null, awareness: null, clientId: null, remoteCursors: new Map() }),
}));

export const createYjsDoc = (): Y.Doc => {
  const doc = new Y.Doc();
  doc.getArray<Path>("paths");
  doc.getArray<Shape>("shapes");
  doc.getArray<Text>("texts");
  return doc;
};

export const getYjsData = (doc: Y.Doc): YjsCanvasData => ({
  paths: doc.getArray<Path>("paths"),
  shapes: doc.getArray<Shape>("shapes"),
  texts: doc.getArray<Text>("texts"),
});
