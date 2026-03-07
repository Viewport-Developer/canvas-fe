import { describe, it, expect, beforeEach } from "vitest";
import { useSelectionStore } from "../../store/selectionStore";
import { useToolStore } from "../../store/toolStore";

describe("통합: setTool 호출 시 clearSelection 동작", () => {
  beforeEach(() => {
    useToolStore.setState({ tool: "draw" });
    useSelectionStore.getState().clearSelection();
  });

  it("선택 추가 후 setTool 호출 시 selection 비워진다", () => {
    useSelectionStore.getState().addSelected("path", "path-1");
    useSelectionStore.getState().addSelected("shape", "shape-1");
    expect(useSelectionStore.getState().selectedPaths.size).toBe(1);
    expect(useSelectionStore.getState().selectedShapes.size).toBe(1);

    useToolStore.getState().setTool("eraser");
    useSelectionStore.getState().clearSelection();

    expect(useSelectionStore.getState().selectedPaths.size).toBe(0);
    expect(useSelectionStore.getState().selectedShapes.size).toBe(0);
  });
});
