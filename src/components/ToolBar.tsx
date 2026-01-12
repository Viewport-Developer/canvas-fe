import styled from "styled-components";
import { useToolStore } from "../store/toolStore";
import { useCanvasStore } from "../store/canvasStore";
import type { Tool } from "../types";

const Container = styled.div`
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  gap: 5px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Button = styled.button<{ $selected?: boolean }>`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => (props.$selected ? "#e0dfff" : "transparent")};
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
`;

// 툴바 컴포넌트
// 그리기 도구를 선택할 수 있는 UI를 제공합니다.
const ToolBar = () => {
  const { tool, setTool } = useToolStore();
  const { clearSelection } = useCanvasStore();

  // 툴을 변경합니다.
  // 툴 변경 시 선택된 요소를 해제합니다.
  const handleToolChange = (newTool: Tool) => {
    clearSelection();
    setTool(newTool);
  };

  return (
    <Container>
      <Button
        onClick={() => handleToolChange("draw")}
        $selected={tool === "draw"}
      >
        ✏️
      </Button>
      <Button
        onClick={() => handleToolChange("eraser")}
        $selected={tool === "eraser"}
      >
        🧹
      </Button>
      <Button
        onClick={() => handleToolChange("pan")}
        $selected={tool === "pan"}
      >
        ✋
      </Button>
      <Button
        onClick={() => handleToolChange("rectangle")}
        $selected={tool === "rectangle"}
      >
        ⬜
      </Button>
      <Button
        onClick={() => handleToolChange("diamond")}
        $selected={tool === "diamond"}
      >
        💎
      </Button>
      <Button
        onClick={() => handleToolChange("circle")}
        $selected={tool === "circle"}
      >
        ⭕
      </Button>
      <Button
        onClick={() => handleToolChange("select")}
        $selected={tool === "select"}
      >
        👆
      </Button>
    </Container>
  );
};

export default ToolBar;
