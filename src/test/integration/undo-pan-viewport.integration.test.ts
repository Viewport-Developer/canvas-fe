import { describe, it, expect, beforeEach } from "vitest";
import { useHistoryStore } from "../../store/historyStore";
import { useViewportStore } from "../../store/viewportStore";
import { useYjsConnectionStore } from "../../store/yjsStore";

describe("통합: undo(pan) → viewportStore.pan 복원", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    useViewportStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("savePanAction 후 undo 시 viewportStore.pan이 이전 값으로 복원된다", () => {
    useViewportStore.getState().setPan({ x: 100, y: 50 });
    useHistoryStore.getState().savePanAction({ x: 0, y: 0 }, { x: 100, y: 50 });

    expect(useViewportStore.getState().pan).toEqual({ x: 100, y: 50 });

    useHistoryStore.getState().undo();

    expect(useViewportStore.getState().pan).toEqual({ x: 0, y: 0 });
  });
});
