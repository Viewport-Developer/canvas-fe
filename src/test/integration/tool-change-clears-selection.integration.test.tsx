import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToolBar from "../../components/ToolBar";
import { useToolStore } from "../../store/toolStore";
import { useSelectionStore } from "../../store/selectionStore";

describe("통합: 도구 변경 시 선택 해제", () => {
  beforeEach(() => {
    useToolStore.setState({ tool: "draw", isPanning: false });
    useSelectionStore.getState().clearSelection();
  });

  it("선택된 상태에서 다른 도구 클릭 시 tool 변경 + selection 비워진다", async () => {
    useSelectionStore.getState().addSelected("path", "path-1");
    expect(useSelectionStore.getState().selectedPaths.size).toBe(1);

    render(<ToolBar />);
    const selectBtn = screen.getAllByRole("button").find((b) => b.textContent === "👆");
    await userEvent.click(selectBtn!);

    expect(useToolStore.getState().tool).toBe("select");
    expect(useSelectionStore.getState().selectedPaths.size).toBe(0);
  });
});
