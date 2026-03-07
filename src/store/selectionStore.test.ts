import { describe, it, expect, beforeEach } from "vitest";
import { useSelectionStore } from "./selectionStore";

describe("selectionStore", () => {
  beforeEach(() => {
    useSelectionStore.getState().clearSelection();
  });

  it("초기값은 빈 Set들", () => {
    const { selectedPaths, selectedShapes, selectedTexts } = useSelectionStore.getState();
    expect(selectedPaths.size).toBe(0);
    expect(selectedShapes.size).toBe(0);
    expect(selectedTexts.size).toBe(0);
  });

  it("addSelected(path)로 path id를 추가한다", () => {
    useSelectionStore.getState().addSelected("path", "path-1");
    expect(useSelectionStore.getState().selectedPaths.has("path-1")).toBe(true);
    useSelectionStore.getState().addSelected("path", "path-2");
    expect(useSelectionStore.getState().selectedPaths.size).toBe(2);
  });

  it("addSelected(shape), addSelected(text)도 동작한다", () => {
    useSelectionStore.getState().addSelected("shape", "s1");
    useSelectionStore.getState().addSelected("text", "t1");
    expect(useSelectionStore.getState().selectedShapes.has("s1")).toBe(true);
    expect(useSelectionStore.getState().selectedTexts.has("t1")).toBe(true);
  });

  it("이미 있으면 중복 추가하지 않는다", () => {
    useSelectionStore.getState().addSelected("path", "p1");
    useSelectionStore.getState().addSelected("path", "p1");
    expect(useSelectionStore.getState().selectedPaths.size).toBe(1);
  });

  it("clearSelection으로 전부 비운다", () => {
    useSelectionStore.getState().addSelected("path", "p1");
    useSelectionStore.getState().addSelected("shape", "s1");
    useSelectionStore.getState().clearSelection();
    expect(useSelectionStore.getState().selectedPaths.size).toBe(0);
    expect(useSelectionStore.getState().selectedShapes.size).toBe(0);
    expect(useSelectionStore.getState().selectedTexts.size).toBe(0);
  });

  it("setIsDragSelecting, setDragStartPoint, setDragEndPoint 동작", () => {
    useSelectionStore.getState().setIsDragSelecting(true);
    expect(useSelectionStore.getState().isDragSelecting).toBe(true);
    useSelectionStore.getState().setDragStartPoint({ x: 0, y: 0 });
    useSelectionStore.getState().setDragEndPoint({ x: 10, y: 10 });
    expect(useSelectionStore.getState().dragStartPoint).toEqual({ x: 0, y: 0 });
    expect(useSelectionStore.getState().dragEndPoint).toEqual({ x: 10, y: 10 });
  });
});
