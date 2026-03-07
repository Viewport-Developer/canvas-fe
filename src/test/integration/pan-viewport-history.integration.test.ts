import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePan } from "../../hooks/usePan";
import { useViewportStore } from "../../store/viewportStore";
import { useHistoryStore } from "../../store/historyStore";
import { useToolStore } from "../../store/toolStore";

describe("통합: usePan → viewport + historyStore.savePanAction", () => {
  beforeEach(() => {
    useViewportStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
    useToolStore.setState({ isPanning: false });
  });

  it("startPanning → doPanning → stopPanning 시 pan 변경되고 savePanAction 호출된다", () => {
    const { result } = renderHook(() => usePan());
    act(() => {
      result.current.startPanning({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });
    act(() => {
      result.current.doPanning({ clientX: 20, clientY: 10 } as React.MouseEvent);
    });
    expect(useViewportStore.getState().pan.x).toBe(-20);
    expect(useViewportStore.getState().pan.y).toBe(-10);

    act(() => {
      result.current.stopPanning();
    });

    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
    expect(useHistoryStore.getState().undoStack[0].type).toBe("pan");
  });
});
