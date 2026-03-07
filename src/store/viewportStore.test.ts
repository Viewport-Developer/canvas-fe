import { describe, it, expect, beforeEach } from "vitest";
import { useViewportStore } from "./viewportStore";

describe("viewportStore", () => {
  beforeEach(() => {
    useViewportStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });
  });

  it("초기값은 zoom 1, pan (0,0)", () => {
    const { zoom, pan } = useViewportStore.getState();
    expect(zoom).toBe(1);
    expect(pan).toEqual({ x: 0, y: 0 });
  });

  it("setZoom으로 줌을 바꾼다", () => {
    useViewportStore.getState().setZoom(2);
    expect(useViewportStore.getState().zoom).toBe(2);
  });

  it("setPan으로 팬을 바꾼다", () => {
    useViewportStore.getState().setPan({ x: 100, y: 50 });
    expect(useViewportStore.getState().pan).toEqual({ x: 100, y: 50 });
  });
});
