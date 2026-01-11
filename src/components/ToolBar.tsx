import styled from "styled-components";
import { useToolStore } from "../store/toolStore";

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

const ToolBar = () => {
  const { tool, setTool } = useToolStore();

  return (
    <Container>
      <Button onClick={() => setTool("draw")} $selected={tool === "draw"}>
        ✏️
      </Button>
      <Button onClick={() => setTool("eraser")} $selected={tool === "eraser"}>
        🧹
      </Button>
      <Button onClick={() => setTool("pan")} $selected={tool === "pan"}>
        ✋
      </Button>
    </Container>
  );
};

export default ToolBar;
