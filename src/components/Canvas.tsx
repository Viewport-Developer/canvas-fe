import { useRef, useEffect, type RefObject } from "react";
import styled from "styled-components";
import { useToolStore } from "../store/toolStore";
import { useDraw } from "../hooks/useDraw";
import { useEraser } from "../hooks/useEraser";
import { usePan } from "../hooks/usePan";
import type { Point } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { useCanvas } from "../hooks/useCanvas";
import { useZoom } from "../hooks/useZoom";

type CanvasProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

type ContainerProps = {
  $tool: "draw" | "eraser" | "pan";
  $isPanning: boolean;
};

const Container = styled.canvas<ContainerProps>`
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

const Canvas = ({ containerRef }: CanvasProps) => {
  const { tool, isPanning } = useToolStore();
  const { zoom, pan } = useCanvasStore();
  const { canUndo, undo, canRedo, redo } = useHistoryStore();

  const { startDrawing, draw, stopDrawing } = useDraw();
  const { startErasing, erase, stopErasing } = useEraser();
  const { startPanning, doPanning, stopPanning } = usePan();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCanvas(canvasRef, containerRef);
  useZoom(canvasRef);

  const getMousePos = (e: React.MouseEvent): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) / zoom + pan.x;
    const y = (e.clientY - rect.top) / zoom + pan.y;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getMousePos(e);

    if (tool === "draw") startDrawing(point);
    if (tool === "pan") startPanning(e);
    if (tool === "eraser") startErasing(point);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getMousePos(e);

    if (tool === "draw") draw(point);
    if (tool === "pan") doPanning(e);
    if (tool === "eraser") erase(point);
  };

  const handleMouseUp = () => {
    if (tool === "draw") stopDrawing();
    if (tool === "pan") stopPanning();
    if (tool === "eraser") stopErasing();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Container
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      $tool={tool}
      $isPanning={isPanning}
    />
  );
};

export default Canvas;
