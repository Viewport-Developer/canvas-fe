import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import styled from "styled-components";
import { useToolStore } from "../store/toolStore";
import { useSelectionStore } from "../store/selectionStore";
import type { Tool } from "../types";

const StyledToolBar = styled.div`
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  padding: 5px;
  gap: 5px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Button = styled.button<{ $selected?: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${(props) => (props.$selected ? "#e0dfff" : "transparent")};
  border: none;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) => (props.$selected ? "#d0cfff" : "#f5f5f5")};
  }
`;

const TOOLS: Array<{ tool: Tool; icon: string }> = [
  { tool: "draw", icon: "✏️" },
  { tool: "eraser", icon: "🧹" },
  { tool: "pan", icon: "✋" },
  { tool: "rectangle", icon: "⬜" },
  { tool: "diamond", icon: "💎" },
  { tool: "circle", icon: "⭕" },
  { tool: "select", icon: "👆" },
  { tool: "text", icon: "📝" },
] as const;

const ToolBar = () => {
  const [tool, setTool] = useToolStore(useShallow((s) => [s.tool, s.setTool]));
  const [clearSelection] = useSelectionStore(useShallow((s) => [s.clearSelection]));

  const handleToolChange = useCallback(
    (newTool: Tool) => {
      setTool(newTool);
      clearSelection();
    },
    [setTool, clearSelection]
  );

  return (
    <StyledToolBar>
      {TOOLS.map(({ tool: toolType, icon }) => (
        <Button
          key={toolType}
          onClick={() => handleToolChange(toolType)}
          $selected={tool === toolType}
        >
          {icon}
        </Button>
      ))}
    </StyledToolBar>
  );
};

export default ToolBar;
