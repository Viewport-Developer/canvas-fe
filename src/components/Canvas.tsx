import { useRef } from "react";
import styled from "styled-components";

type CanvasProps = {
  $tool: "draw" | "eraser" | "pan";
  $isPanning: boolean;
};

const Container = styled.canvas<CanvasProps>`
  width: 100%;
  height: 100%;
  cursor: ${(props) => {
    if (props.$tool === "pan") {
      return props.$isPanning ? "grabbing" : "grab";
    }
    if (props.$tool === "eraser") {
      return "cell";
    }
    return "crosshair";
  }};
`;

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return <Container ref={canvasRef} $tool={"draw"} $isPanning={false} />;
};

export default Canvas;
