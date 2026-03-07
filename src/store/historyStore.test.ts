import { describe, it, expect, beforeEach, vi } from "vitest";
import { useHistoryStore } from "./historyStore";

vi.mock("../utils", () => ({
  pushPathToYjs: vi.fn(),
  removePathsFromYjs: vi.fn(),
  pushShapeToYjs: vi.fn(),
  removeShapesFromYjs: vi.fn(),
  pushTextToYjs: vi.fn(),
  removeTextsFromYjs: vi.fn(),
}));

vi.mock("./viewportStore", () => ({
  useViewportStore: {
    getState: vi.fn(() => ({ setPan: vi.fn() })),
  },
}));

const makeBox = (x: number, y: number, w: number, h: number) => ({
  topLeft: { x, y },
  topRight: { x: x + w, y },
  bottomLeft: { x, y: y + h },
  bottomRight: { x: x + w, y: y + h },
});

describe("historyStore", () => {
  beforeEach(() => {
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("초기값은 빈 undo/redo 스택", () => {
    expect(useHistoryStore.getState().undoStack).toEqual([]);
    expect(useHistoryStore.getState().redoStack).toEqual([]);
  });

  it("saveDrawAction 후 canUndo true, redoStack 비움", () => {
    const path = {
      id: "path-1",
      points: [{ x: 0, y: 0 }],
      color: "#000",
      width: 2,
      boundingBox: makeBox(0, 0, 1, 1),
    };
    useHistoryStore.getState().saveDrawAction(path);
    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
    expect(useHistoryStore.getState().redoStack).toHaveLength(0);
    expect(useHistoryStore.getState().canUndo()).toBe(true);
    expect(useHistoryStore.getState().canRedo()).toBe(false);
  });

  it("saveShapeAction 후 스택에 shape 액션 추가", () => {
    const shape = {
      id: "shape-1",
      type: "rectangle" as const,
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 10, y: 10 },
      color: "#000",
      width: 2,
      boundingBox: makeBox(0, 0, 10, 10),
    };
    useHistoryStore.getState().saveShapeAction(shape);
    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
    expect(useHistoryStore.getState().undoStack[0].type).toBe("shape");
  });

  it("undo 시 스택에서 마지막 액션을 redo로 옮긴다", () => {
    const path = {
      id: "path-1",
      points: [{ x: 0, y: 0 }],
      color: "#000",
      width: 2,
      boundingBox: makeBox(0, 0, 1, 1),
    };
    useHistoryStore.getState().saveDrawAction(path);
    useHistoryStore.getState().undo();
    expect(useHistoryStore.getState().undoStack).toHaveLength(0);
    expect(useHistoryStore.getState().redoStack).toHaveLength(1);
    expect(useHistoryStore.getState().canUndo()).toBe(false);
    expect(useHistoryStore.getState().canRedo()).toBe(true);
  });

  it("redo 시 redo 스택에서 undo 스택으로 옮긴다", () => {
    const path = {
      id: "path-1",
      points: [{ x: 0, y: 0 }],
      color: "#000",
      width: 2,
      boundingBox: makeBox(0, 0, 1, 1),
    };
    useHistoryStore.getState().saveDrawAction(path);
    useHistoryStore.getState().undo();
    useHistoryStore.getState().redo();
    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
    expect(useHistoryStore.getState().redoStack).toHaveLength(0);
  });

  it("savePanAction 후 undo 시 스택만 이동 (pan 복원은 viewport mock)", () => {
    useHistoryStore.getState().savePanAction({ x: 0, y: 0 }, { x: 100, y: 50 });
    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
    expect(useHistoryStore.getState().undoStack[0].type).toBe("pan");
    useHistoryStore.getState().undo();
    expect(useHistoryStore.getState().undoStack).toHaveLength(0);
    expect(useHistoryStore.getState().redoStack[0].type).toBe("pan");
  });
});
