import { create } from "zustand";
import type {
  BoundingBox,
  DrawAction,
  EraseAction,
  HistoryAction,
  MoveAction,
  Path,
  Point,
  ResizeAction,
  Shape,
  ShapeAction,
  Text,
  TextAction,
  PanAction,
} from "../types";
import { useViewportStore } from "./viewportStore";
import {
  pushPathToYjs,
  removePathsFromYjs,
  pushShapeToYjs,
  removeShapesFromYjs,
  pushTextToYjs,
  removeTextsFromYjs,
} from "../utils";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export type HistoryStore = {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];

  saveDrawAction: (path: DrawAction["path"]) => void;
  saveShapeAction: (shape: ShapeAction["shape"]) => void;
  saveTextAction: (previousText: Text | null, newText: Text) => void;
  saveEraseAction: (paths: EraseAction["paths"], shapes: EraseAction["shapes"], texts: EraseAction["texts"]) => void;
  savePanAction: (previousPan: Point, newPan: Point) => void;
  saveResizeAction: (
    previousPaths: Path[],
    previousShapes: Shape[],
    previousTexts: Text[],
    previousBoundingBox: BoundingBox,
    newPaths: Path[],
    newShapes: Shape[],
    newTexts: Text[],
    newBoundingBox: BoundingBox,
  ) => void;
  saveMoveAction: (
    previousPaths: Path[],
    previousShapes: Shape[],
    previousTexts: Text[],
    newPaths: Path[],
    newShapes: Shape[],
    newTexts: Text[],
  ) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

// 액션을 스택에 추가하는 함수
const addActionToStack = (action: HistoryAction, currentStack: HistoryAction[]): HistoryAction[] => {
  const newStack = [...currentStack, action];

  // 최대 스택 크기 제한
  return newStack.length > CANVAS_CONFIG.MAX_STACK_SIZE ? newStack.slice(-CANVAS_CONFIG.MAX_STACK_SIZE) : newStack;
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],

  saveDrawAction: (path) => {
    const action: DrawAction = {
      type: "draw",
      path: { ...path },
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [],
    }));
  },

  saveShapeAction: (shape) => {
    const action: ShapeAction = {
      type: "shape",
      shape: { ...shape },
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [],
    }));
  },

  saveTextAction: (previousText, newText) => {
    const action: TextAction = {
      type: "text",
      previousText: previousText ? { ...previousText } : null,
      newText: { ...newText },
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [],
    }));
  },

  saveEraseAction: (paths, shapes, texts = []) => {
    const action: EraseAction = {
      type: "erase",
      paths: paths.map((path) => ({ ...path })),
      shapes: shapes.map((shape) => ({ ...shape })),
      texts: texts.map((text) => ({ ...text })),
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [],
    }));
  },

  savePanAction: (previousPan, newPan) => {
    const action: PanAction = {
      type: "pan",
      previousPan: { ...previousPan },
      newPan: { ...newPan },
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [],
    }));
  },

  saveResizeAction: (
    previousPaths,
    previousShapes,
    previousTexts,
    previousBoundingBox,
    newPaths,
    newShapes,
    newTexts,
    newBoundingBox,
  ) => {
    const action: ResizeAction = {
      type: "resize",
      previousPaths: previousPaths.map((path) => ({ ...path })),
      previousShapes: previousShapes.map((shape) => ({ ...shape })),
      previousTexts: previousTexts.map((text) => ({ ...text })),
      previousBoundingBox: { ...previousBoundingBox },
      newPaths: newPaths.map((path) => ({ ...path })),
      newShapes: newShapes.map((shape) => ({ ...shape })),
      newTexts: newTexts.map((text) => ({ ...text })),
      newBoundingBox: { ...newBoundingBox },
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [],
    }));
  },

  saveMoveAction: (previousPaths, previousShapes, previousTexts, newPaths, newShapes, newTexts) => {
    const action: MoveAction = {
      type: "move",
      previousPaths: previousPaths.map((path) => ({ ...path })),
      previousShapes: previousShapes.map((shape) => ({ ...shape })),
      previousTexts: previousTexts.map((text) => ({ ...text })),
      newPaths: newPaths.map((path) => ({ ...path })),
      newShapes: newShapes.map((shape) => ({ ...shape })),
      newTexts: newTexts.map((text) => ({ ...text })),
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [],
    }));
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const lastAction = state.undoStack[state.undoStack.length - 1];
    const viewportStore = useViewportStore.getState();

    switch (lastAction.type) {
      case "draw":
        removePathsFromYjs([lastAction.path.id]);
        break;
      case "shape":
        removeShapesFromYjs([lastAction.shape.id]);
        break;
      case "text": {
        if (lastAction.previousText) pushTextToYjs(lastAction.previousText);
        if (lastAction.newText) removeTextsFromYjs([lastAction.newText.id]);
        break;
      }
      case "erase":
        for (const path of lastAction.paths) {
          pushPathToYjs(path);
        }
        for (const shape of lastAction.shapes) {
          pushShapeToYjs(shape);
        }
        for (const text of lastAction.texts) {
          pushTextToYjs(text);
        }
        break;
      case "pan":
        viewportStore.setPan(lastAction.previousPan);
        break;
      case "resize": {
        const previousPathIds = lastAction.previousPaths.map((p) => p.id);
        const previousShapeIds = lastAction.previousShapes.map((s) => s.id);
        const previousTextIds = lastAction.previousTexts.map((t) => t.id);

        removePathsFromYjs(previousPathIds);
        lastAction.previousPaths.forEach((path) => pushPathToYjs(path));
        removeShapesFromYjs(previousShapeIds);
        lastAction.previousShapes.forEach((shape) => pushShapeToYjs(shape));
        removeTextsFromYjs(previousTextIds);
        lastAction.previousTexts.forEach((text) => pushTextToYjs(text));
        break;
      }
      case "move": {
        const previousPathIds = lastAction.previousPaths.map((p) => p.id);
        const previousShapeIds = lastAction.previousShapes.map((s) => s.id);
        const previousTextIds = lastAction.previousTexts.map((t) => t.id);

        removePathsFromYjs(previousPathIds);
        lastAction.previousPaths.forEach((path) => pushPathToYjs(path));
        removeShapesFromYjs(previousShapeIds);
        lastAction.previousShapes.forEach((shape) => pushShapeToYjs(shape));
        removeTextsFromYjs(previousTextIds);
        lastAction.previousTexts.forEach((text) => pushTextToYjs(text));
        break;
      }
      default:
        break;
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
    const viewportStore = useViewportStore.getState();

    switch (nextAction.type) {
      case "draw":
        pushPathToYjs(nextAction.path);
        break;
      case "shape":
        pushShapeToYjs(nextAction.shape);
        break;
      case "text": {
        if (nextAction.previousText) removeTextsFromYjs([nextAction.previousText.id]);
        if (nextAction.newText) pushTextToYjs(nextAction.newText);
        break;
      }
      case "erase": {
        const pathIds = nextAction.paths.map((path) => path.id);
        const shapeIds = nextAction.shapes.map((shape) => shape.id);
        const textIds = nextAction.texts.map((text) => text.id);
        removePathsFromYjs(pathIds);
        removeShapesFromYjs(shapeIds);
        removeTextsFromYjs(textIds);
        break;
      }
      case "pan":
        viewportStore.setPan(nextAction.newPan);
        break;
      case "resize": {
        const newPathIds = nextAction.newPaths.map((p) => p.id);
        const newShapeIds = nextAction.newShapes.map((s) => s.id);
        const newTextIds = nextAction.newTexts.map((t) => t.id);

        removePathsFromYjs(newPathIds);
        nextAction.newPaths.forEach((path) => pushPathToYjs(path));
        removeShapesFromYjs(newShapeIds);
        nextAction.newShapes.forEach((shape) => pushShapeToYjs(shape));
        removeTextsFromYjs(newTextIds);
        nextAction.newTexts.forEach((text) => pushTextToYjs(text));
        break;
      }
      case "move": {
        const newPathIds = nextAction.newPaths.map((p) => p.id);
        const newShapeIds = nextAction.newShapes.map((s) => s.id);
        const newTextIds = nextAction.newTexts.map((t) => t.id);

        removePathsFromYjs(newPathIds);
        nextAction.newPaths.forEach((path) => pushPathToYjs(path));
        removeShapesFromYjs(newShapeIds);
        nextAction.newShapes.forEach((shape) => pushShapeToYjs(shape));
        removeTextsFromYjs(newTextIds);
        nextAction.newTexts.forEach((text) => pushTextToYjs(text));
        break;
      }
      default:
        break;
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
