import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "../../store/historyStore";
import { usePathStore } from "../../store/pathStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makePath } from "./_fixtures";

describe("통합: undo → pathStore 반영 (오프라인)", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    usePathStore.setState({ paths: [], currentPaths: [] });
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("saveDrawAction 후 undo 시 pathStore에서 해당 path가 제거된다", () => {
    const path = makePath("path-1");
    usePathStore.getState().setPaths([path]);
    useHistoryStore.getState().saveDrawAction(path);

    expect(usePathStore.getState().paths).toHaveLength(1);

    useHistoryStore.getState().undo();

    expect(usePathStore.getState().paths).toHaveLength(0);
    expect(useHistoryStore.getState().undoStack).toHaveLength(0);
    expect(useHistoryStore.getState().redoStack).toHaveLength(1);
  });
});
