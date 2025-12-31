import { create } from "zustand";
import type { Path, Point } from "../types";
import { useCanvasStore } from "./canvasStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export interface CanvasSnapshot {
  paths: Path[];
  zoom: number;
  pan: Point;
}

interface HistoryStore {
  undoStack: CanvasSnapshot[];
  redoStack: CanvasSnapshot[];

  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],

  saveHistory: () => {
    const canvasState = useCanvasStore.getState();
    const currentSnapshot: CanvasSnapshot = {
      paths: [...canvasState.paths],
      zoom: canvasState.zoom,
      pan: { ...canvasState.pan },
    };

    set((prevState) => {
      const newUndoStack = [...prevState.undoStack, currentSnapshot];

      const trimmedUndoStack =
        newUndoStack.length > CANVAS_CONFIG.MAX_STACK_SIZE
          ? newUndoStack.slice(-CANVAS_CONFIG.MAX_STACK_SIZE)
          : newUndoStack;
      console.log(trimmedUndoStack);
      return {
        undoStack: trimmedUndoStack,
        redoStack: [],
      };
    });
  },

  undo: () => {
    const state = get();

    const previousSnapshot = state.undoStack[state.undoStack.length - 2];
    const currentSnapshot = state.undoStack[state.undoStack.length - 1];

    const canvasStore = useCanvasStore.getState();
    canvasStore.setPaths(previousSnapshot.paths);
    canvasStore.setZoom(previousSnapshot.zoom);
    canvasStore.setPan(previousSnapshot.pan);

    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentSnapshot],
    });
  },

  redo: () => {
    const state = get();

    const canvasStore = useCanvasStore.getState();
    const nextSnapshot = state.redoStack[state.redoStack.length - 1];
    const currentSnapshot: CanvasSnapshot = {
      paths: [...canvasStore.paths],
      zoom: canvasStore.zoom,
      pan: { ...canvasStore.pan },
    };

    canvasStore.setPaths(nextSnapshot.paths);
    canvasStore.setZoom(nextSnapshot.zoom);
    canvasStore.setPan(nextSnapshot.pan);

    set({
      undoStack: [...state.undoStack, currentSnapshot],
      redoStack: state.redoStack.slice(0, -1),
    });
  },

  canUndo: () => {
    return get().undoStack.length > 1;
  },

  canRedo: () => {
    return get().redoStack.length > 0;
  },
}));
