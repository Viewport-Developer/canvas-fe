import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "../../store/historyStore";
import { useShapeStore } from "../../store/shapeStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makeShape } from "./_fixtures";

describe("통합: undo(shape) → shapeStore 반영 (오프라인)", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    useShapeStore.setState({ shapes: [], currentShapes: [] });
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("saveShapeAction 후 undo 시 shapeStore에서 해당 shape가 제거된다", () => {
    const shape = makeShape("shape-1");
    useShapeStore.getState().setShapes([shape]);
    useHistoryStore.getState().saveShapeAction(shape);

    expect(useShapeStore.getState().shapes).toHaveLength(1);

    useHistoryStore.getState().undo();

    expect(useShapeStore.getState().shapes).toHaveLength(0);
  });
});
