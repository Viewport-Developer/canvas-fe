import { create } from "zustand";
import type {
  HistoryAction,
  DrawAction,
  EraseAction,
  PanAction,
  ShapeAction,
  ResizeAction,
  Point,
  Path,
  Shape,
  BoundingBox,
} from "../types";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useViewportStore } from "./viewportStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

// 히스토리 스토어 인터페이스
// Undo/Redo 기능을 제공합니다.
interface HistoryStore {
  // Undo 스택
  undoStack: HistoryAction[];
  // Redo 스택
  redoStack: HistoryAction[];

  // 그리기 액션 저장
  saveDrawAction: (path: DrawAction["path"]) => void;
  // 지우기 액션 저장
  saveEraseAction: (
    paths: EraseAction["paths"],
    shapes: EraseAction["shapes"]
  ) => void;
  // 팬 액션 저장
  savePanAction: (previousPan: Point, newPan: Point) => void;
  // 도형 생성 액션 저장
  saveShapeAction: (shape: ShapeAction["shape"]) => void;
  // 리사이즈 액션 저장
  saveResizeAction: (
    previousPaths: Path[],
    previousShapes: Shape[],
    previousBoundingBox: BoundingBox,
    newPaths: Path[],
    newShapes: Shape[],
    newBoundingBox: BoundingBox
  ) => void;

  // Undo 실행
  undo: () => void;
  // Redo 실행
  redo: () => void;
  // Undo 가능 여부 확인
  canUndo: () => boolean;
  // Redo 가능 여부 확인
  canRedo: () => boolean;
}

// 액션을 스택에 추가하는 헬퍼 함수
const addActionToStack = (
  action: HistoryAction,
  currentStack: HistoryAction[]
): HistoryAction[] => {
  const newStack = [...currentStack, action];

  // 최대 스택 크기 제한
  return newStack.length > CANVAS_CONFIG.MAX_STACK_SIZE
    ? newStack.slice(-CANVAS_CONFIG.MAX_STACK_SIZE)
    : newStack;
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],

  saveDrawAction: (path) => {
    const action: DrawAction = {
      type: "draw",
      path,
    };

    set((prevState) => ({
      undoStack: addActionToStack(action, prevState.undoStack),
      redoStack: [], // 새로운 액션이 추가되면 redo 스택 초기화
    }));
  },

  saveEraseAction: (paths, shapes) => {
    const action: EraseAction = {
      type: "erase",
      paths: paths.map((path) => ({ ...path })),
      shapes: shapes.map((shape) => ({ ...shape })),
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

  saveResizeAction: (
    previousPaths,
    previousShapes,
    previousBoundingBox,
    newPaths,
    newShapes,
    newBoundingBox
  ) => {
    const action: ResizeAction = {
      type: "resize",
      previousPaths: previousPaths.map((path) => ({ ...path })),
      previousShapes: previousShapes.map((shape) => ({ ...shape })),
      previousBoundingBox: { ...previousBoundingBox },
      newPaths: newPaths.map((path) => ({ ...path })),
      newShapes: newShapes.map((shape) => ({ ...shape })),
      newBoundingBox: { ...newBoundingBox },
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
    const pathStore = usePathStore.getState();
    const shapeStore = useShapeStore.getState();
    const viewportStore = useViewportStore.getState();

    // 액션 타입에 따라 Undo 실행
    switch (lastAction.type) {
      case "draw":
        pathStore.removePaths([lastAction.path.id]);
        break;
      case "erase":
        // 지운 요소들을 다시 추가
        lastAction.paths.forEach((path) => {
          pathStore.addPath(path);
        });
        lastAction.shapes.forEach((shape) => {
          shapeStore.addShape(shape);
        });
        break;
      case "pan":
        viewportStore.setPan(lastAction.previousPan);
        break;
      case "shape":
        shapeStore.removeShapes([lastAction.shape.id]);
        break;
      case "resize": {
        // 리사이즈 전 상태로 복원 (선택된 요소만 업데이트)
        const currentPaths = pathStore.paths;
        const currentShapes = shapeStore.shapes;

        // 이전 경로로 교체
        const updatedPaths = currentPaths.map((path) => {
          const previousPath = lastAction.previousPaths.find(
            (p) => p.id === path.id
          );
          return previousPath || path;
        });

        // 이전 도형으로 교체
        const updatedShapes = currentShapes.map((shape) => {
          const previousShape = lastAction.previousShapes.find(
            (s) => s.id === shape.id
          );
          return previousShape || shape;
        });

        pathStore.setPaths(updatedPaths);
        shapeStore.setShapes(updatedShapes);
        break;
      }
    }

    // 스택 업데이트
    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, lastAction],
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const nextAction = state.redoStack[state.redoStack.length - 1];
    const pathStore = usePathStore.getState();
    const shapeStore = useShapeStore.getState();
    const viewportStore = useViewportStore.getState();

    // 액션 타입에 따라 Redo 실행
    switch (nextAction.type) {
      case "draw":
        pathStore.addPath(nextAction.path);
        break;
      case "erase": {
        // 요소들을 다시 삭제
        const pathIds = nextAction.paths.map((path) => path.id);
        const shapeIds = nextAction.shapes.map((shape) => shape.id);
        pathStore.removePaths(pathIds);
        shapeStore.removeShapes(shapeIds);
        break;
      }
      case "pan":
        viewportStore.setPan(nextAction.newPan);
        break;
      case "shape":
        shapeStore.addShape(nextAction.shape);
        break;
      case "resize": {
        // 리사이즈 후 상태로 복원 (선택된 요소만 업데이트)
        const currentPaths = pathStore.paths;
        const currentShapes = shapeStore.shapes;

        // 새 경로로 교체
        const updatedPaths = currentPaths.map((path) => {
          const newPath = nextAction.newPaths.find((p) => p.id === path.id);
          return newPath || path;
        });

        // 새 도형으로 교체
        const updatedShapes = currentShapes.map((shape) => {
          const newShape = nextAction.newShapes.find((s) => s.id === shape.id);
          return newShape || shape;
        });

        pathStore.setPaths(updatedPaths);
        shapeStore.setShapes(updatedShapes);
        break;
      }
    }

    // 스택 업데이트
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
