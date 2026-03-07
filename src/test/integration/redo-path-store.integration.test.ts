import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "../../store/historyStore";
import { usePathStore } from "../../store/pathStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makePath } from "./_fixtures";

describe("통합: redo → pathStore 반영 (오프라인)", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    usePathStore.setState({ paths: [], currentPaths: [] });
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("undo 후 redo 시 pathStore에 path가 다시 들어간다", () => {
    const path = makePath("path-1");
    usePathStore.getState().setPaths([path]);
    useHistoryStore.getState().saveDrawAction(path);
    useHistoryStore.getState().undo();

    expect(usePathStore.getState().paths).toHaveLength(0);

    useHistoryStore.getState().redo();

    expect(usePathStore.getState().paths).toHaveLength(1);
    expect(usePathStore.getState().paths[0].id).toBe("path-1");
  });
});
