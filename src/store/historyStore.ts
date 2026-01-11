import { create } from "zustand";
import type {
  HistoryAction,
  DrawAction,
  EraseAction,
  PanAction,
  ShapeAction,
  Point,
} from "../types";
import { useCanvasStore } from "./canvasStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

interface HistoryStore {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];

  saveDrawAction: (path: DrawAction["path"]) => void;
  saveEraseAction: (
    paths: EraseAction["paths"],
    shapes: EraseAction["shapes"]
  ) => void;
  savePanAction: (previousPan: Point, newPan: Point) => void;
  saveShapeAction: (shape: ShapeAction["shape"]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],

  saveDrawAction: (path) => {
    const action: DrawAction = {
      type: "draw",
      path,
    };

    set((prevState) => {
      const newUndoStack = [...prevState.undoStack, action];

      const trimmedUndoStack =
        newUndoStack.length > CANVAS_CONFIG.MAX_STACK_SIZE
          ? newUndoStack.slice(-CANVAS_CONFIG.MAX_STACK_SIZE)
          : newUndoStack;

      return {
        undoStack: trimmedUndoStack,
        redoStack: [],
      };
    });
  },

  saveEraseAction: (paths, shapes) => {
    const action: EraseAction = {
      type: "erase",
      paths: paths.map((path) => ({ ...path })),
      shapes: shapes.map((shape) => ({ ...shape })),
    };

    set((prevState) => {
      const newUndoStack = [...prevState.undoStack, action];

      const trimmedUndoStack =
        newUndoStack.length > CANVAS_CONFIG.MAX_STACK_SIZE
          ? newUndoStack.slice(-CANVAS_CONFIG.MAX_STACK_SIZE)
          : newUndoStack;

      return {
        undoStack: trimmedUndoStack,
        redoStack: [],
      };
    });
  },

  savePanAction: (previousPan, newPan) => {
    const action: PanAction = {
      type: "pan",
      previousPan: { ...previousPan },
      newPan: { ...newPan },
    };

    set((prevState) => {
      const newUndoStack = [...prevState.undoStack, action];

      const trimmedUndoStack =
        newUndoStack.length > CANVAS_CONFIG.MAX_STACK_SIZE
          ? newUndoStack.slice(-CANVAS_CONFIG.MAX_STACK_SIZE)
          : newUndoStack;

      return {
        undoStack: trimmedUndoStack,
        redoStack: [],
      };
    });
  },

  saveShapeAction: (shape) => {
    const action: ShapeAction = {
      type: "shape",
      shape: { ...shape },
    };

    set((prevState) => {
      const newUndoStack = [...prevState.undoStack, action];

      const trimmedUndoStack =
        newUndoStack.length > CANVAS_CONFIG.MAX_STACK_SIZE
          ? newUndoStack.slice(-CANVAS_CONFIG.MAX_STACK_SIZE)
          : newUndoStack;

      return {
        undoStack: trimmedUndoStack,
        redoStack: [],
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const lastAction = state.undoStack[state.undoStack.length - 1];
    const canvasStore = useCanvasStore.getState();

    if (lastAction.type === "draw") {
      canvasStore.removePaths([lastAction.path.id]);
    } else if (lastAction.type === "erase") {
      lastAction.paths.forEach((path) => {
        canvasStore.addPath(path);
      });
      lastAction.shapes.forEach((shape) => {
        canvasStore.addShape(shape);
      });
    } else if (lastAction.type === "pan") {
      canvasStore.setPan(lastAction.previousPan);
    } else if (lastAction.type === "shape") {
      canvasStore.removeShapes([lastAction.shape.id]);
    }

    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, lastAction],
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const nextAction = state.redoStack[state.redoStack.length - 1];
    const canvasStore = useCanvasStore.getState();

    if (nextAction.type === "draw") {
      canvasStore.addPath(nextAction.path);
    } else if (nextAction.type === "erase") {
      const pathIds = nextAction.paths.map((path) => path.id);
      const shapeIds = nextAction.shapes.map((shape) => shape.id);
      canvasStore.removePaths(pathIds);
      canvasStore.removeShapes(shapeIds);
    } else if (nextAction.type === "pan") {
      canvasStore.setPan(nextAction.newPan);
    } else if (nextAction.type === "shape") {
      canvasStore.addShape(nextAction.shape);
    }

    set({
      undoStack: [...state.undoStack, nextAction],
      redoStack: state.redoStack.slice(0, -1),
    });
  },

  canUndo: () => {
    return get().undoStack.length > 0;
  },

  canRedo: () => {
    return get().redoStack.length > 0;
  },
}));
