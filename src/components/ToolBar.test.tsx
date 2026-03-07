import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToolBar from "./ToolBar";
import { useToolStore } from "../store/toolStore";
import { useSelectionStore } from "../store/selectionStore";

describe("ToolBar", () => {
  beforeEach(() => {
    useToolStore.setState({ tool: "draw", isPanning: false });
    useSelectionStore.getState().clearSelection();
  });

  it("8개 도구 버튼을 렌더링한다", () => {
    render(<ToolBar />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(8);
  });

  it("버튼 클릭 시 도구가 바뀌고 선택이 해제된다", async () => {
    useToolStore.setState({ tool: "draw" });
    useSelectionStore.getState().addSelected("path", "p1");

    render(<ToolBar />);
    const selectButton = screen.getAllByRole("button").find((b) => b.textContent === "👆");
    expect(selectButton).toBeDefined();
    await userEvent.click(selectButton!);

    expect(useToolStore.getState().tool).toBe("select");
    expect(useSelectionStore.getState().selectedPaths.size).toBe(0);
  });

  it("현재 선택된 도구 버튼은 $selected 스타일이 적용된다", () => {
    useToolStore.setState({ tool: "eraser" });
    render(<ToolBar />);
    const buttons = screen.getAllByRole("button");
    const eraserBtn = buttons.find((b) => b.textContent === "🧹");
    expect(eraserBtn).toHaveStyle({ backgroundColor: "rgb(224, 223, 255)" });
  });
});
