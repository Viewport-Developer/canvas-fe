import { describe, it, expect, beforeEach } from "vitest";
import { useToolStore } from "./toolStore";

describe("toolStore", () => {
  beforeEach(() => {
    useToolStore.setState({ tool: "draw", isPanning: false });
  });

  it("초기값은 draw, isPanning false", () => {
    const { tool, isPanning } = useToolStore.getState();
    expect(tool).toBe("draw");
    expect(isPanning).toBe(false);
  });

  it("setTool로 도구를 바꾼다", () => {
    useToolStore.getState().setTool("eraser");
    expect(useToolStore.getState().tool).toBe("eraser");

    useToolStore.getState().setTool("select");
    expect(useToolStore.getState().tool).toBe("select");
  });

  it("setIsPanning으로 팬 상태를 바꾼다", () => {
    useToolStore.getState().setIsPanning(true);
    expect(useToolStore.getState().isPanning).toBe(true);
  });
});
