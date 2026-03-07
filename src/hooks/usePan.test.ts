import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePan } from "./usePan";
import { useViewportStore } from "../store/viewportStore";
import { useToolStore } from "../store/toolStore";

describe("usePan", () => {
  beforeEach(() => {
    useViewportStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });
    useToolStore.setState({ isPanning: false });
  });

  it("startPanning 시 isPanning이 true가 된다", () => {
    const { result } = renderHook(() => usePan());
    act(() => {
      result.current.startPanning({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });
    expect(useToolStore.getState().isPanning).toBe(true);
  });

  it("doPanning 시 pan이 이동한다", () => {
    const { result } = renderHook(() => usePan());
    act(() => {
      result.current.startPanning({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });
    act(() => {
      result.current.doPanning({ clientX: 20, clientY: 10 } as React.MouseEvent);
    });
    const pan = useViewportStore.getState().pan;
    expect(pan.x).toBe(-20);
    expect(pan.y).toBe(-10);
  });

  it("stopPanning 시 isPanning이 false가 된다", () => {
    const { result } = renderHook(() => usePan());
    act(() => {
      result.current.startPanning({ clientX: 0, clientY: 0 } as React.MouseEvent);
    });
    act(() => {
      result.current.stopPanning();
    });
    expect(useToolStore.getState().isPanning).toBe(false);
  });
});
