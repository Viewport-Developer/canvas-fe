import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useZoom } from "./useZoom";
import { useViewportStore } from "../store/viewportStore";

describe("useZoom", () => {
  beforeEach(() => {
    useViewportStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });
  });

  it("캔버스 ref가 없어도 에러 없이 동작한다", () => {
    const ref = { current: null as HTMLCanvasElement | null };
    expect(() => renderHook(() => useZoom(ref))).not.toThrow();
  });

  it("캔버스에 Ctrl+휠 이벤트 시 zoom이 변경된다", async () => {
    const canvas = document.createElement("canvas");
    const ref = { current: canvas };
    renderHook(() => useZoom(ref));

    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 200, height: 200 }),
    });
    const wheelIn = new WheelEvent("wheel", { bubbles: true, ctrlKey: true, deltaY: -100, clientX: 50, clientY: 50 });
    await act(async () => {
      canvas.dispatchEvent(wheelIn);
    });
    expect(useViewportStore.getState().zoom).not.toBe(1);
  });
});
