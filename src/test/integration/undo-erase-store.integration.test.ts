import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "../../store/historyStore";
import { usePathStore } from "../../store/pathStore";
import { useShapeStore } from "../../store/shapeStore";
import { useTextStore } from "../../store/textStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makePath, makeShape, makeText } from "./_fixtures";

describe("통합: undo(erase) → path/shape/textStore 복원 (오프라인)", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    usePathStore.setState({ paths: [], currentPaths: [] });
    useShapeStore.setState({ shapes: [], currentShapes: [] });
    useTextStore.setState({ texts: [], currentTexts: [] });
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("saveEraseAction 후 undo 시 지웠던 path/shape/text가 스토어에 복원된다", () => {
    const path = makePath("path-1");
    const shape = makeShape("shape-1");
    const text = makeText("text-1");
    usePathStore.getState().setPaths([path]);
    useShapeStore.getState().setShapes([shape]);
    useTextStore.getState().setTexts([text]);

    useHistoryStore.getState().saveEraseAction([path], [shape], [text]);
    usePathStore.getState().setPaths([]);
    useShapeStore.getState().setShapes([]);
    useTextStore.getState().setTexts([]);

    useHistoryStore.getState().undo();

    expect(usePathStore.getState().paths).toHaveLength(1);
    expect(useShapeStore.getState().shapes).toHaveLength(1);
    expect(useTextStore.getState().texts).toHaveLength(1);
  });
});
