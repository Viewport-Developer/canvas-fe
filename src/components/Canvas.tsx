import { useRef, useEffect, type RefObject } from "react";
import styled from "styled-components";
import { useToolStore } from "../store/toolStore";
import { useDraw } from "../hooks/useDraw";
import { useEraser } from "../hooks/useEraser";
import { usePan } from "../hooks/usePan";
import { useShape } from "../hooks/useShape";
import { useSelect } from "../hooks/useSelect";
import { useResize } from "../hooks/useResize";
import type { Point, Tool } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { useCanvas } from "../hooks/useCanvas";
import { useZoom } from "../hooks/useZoom";

type CanvasProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

type ContainerProps = {
  $tool: Tool;
  $isPanning: boolean;
};

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const CanvasLayer = styled.canvas<ContainerProps>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: ${(props) => {
    if (props.$tool === "pan") {
      return props.$isPanning ? "grabbing" : "grab";
    }
    if (props.$tool === "eraser") {
      return "cell";
    }
    if (props.$tool === "select") {
      return "pointer";
    }
    return "crosshair";
  }};
`;

const Canvas = ({ containerRef }: CanvasProps) => {
  const { tool, isPanning } = useToolStore();
  const {
    zoom,
    pan,
    currentPath,
    currentShape,
    paths,
    shapes,
    selectedPathIds,
    selectedShapeIds,
    removePaths,
    removeShapes,
    clearSelection,
  } = useCanvasStore();
  const { canUndo, undo, canRedo, redo, saveEraseAction } = useHistoryStore();

  // 각 기능별 훅
  const { startDrawing, draw, stopDrawing } = useDraw();
  const { startErasing, erase, stopErasing } = useEraser();
  const { startPanning, doPanning, stopPanning } = usePan();
  const { startShapeDrawing, drawShape, stopShapeDrawing } = useShape();
  const { selectAtPoint } = useSelect();
  const { isResizing, startResizing, resize, stopResizing } = useResize();

  // 캔버스 레이어 참조
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);

  // 캔버스 렌더링 및 줌 설정
  useCanvas(backgroundCanvasRef, foregroundCanvasRef, containerRef);
  useZoom(backgroundCanvasRef);

  // 마우스 이벤트의 캔버스 좌표 계산
  const getMousePos = (e: React.MouseEvent): Point => {
    // 현재 그리는 중인 요소가 있으면 포그라운드 캔버스 사용
    const canvas = currentPath || currentShape ? foregroundCanvasRef.current : backgroundCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // 화면 좌표를 캔버스 좌표로 변환 (줌과 팬 고려)
    const x = (e.clientX - rect.left) / zoom + pan.x;
    const y = (e.clientY - rect.top) / zoom + pan.y;

    return { x, y };
  };

  // 마우스 다운 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getMousePos(e);

    switch (tool) {
      case "draw":
        startDrawing(point);
        break;
      case "pan":
        startPanning(e);
        break;
      case "eraser":
        startErasing(point);
        break;
      case "rectangle":
        startShapeDrawing(point, "rectangle");
        break;
      case "diamond":
        startShapeDrawing(point, "diamond");
        break;
      case "circle":
        startShapeDrawing(point, "circle");
        break;
      case "select":
        // 먼저 리사이즈 핸들을 확인
        if (!startResizing(point)) {
          // 리사이즈 핸들이 아니면 선택 시도
          selectAtPoint(point);
        }
        break;
    }
  };

  // 마우스 이동 이벤트 핸들러
  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getMousePos(e);

    switch (tool) {
      case "draw":
        draw(point);
        break;
      case "pan":
        doPanning(e);
        break;
      case "eraser":
        erase(point);
        break;
      case "rectangle":
      case "diamond":
      case "circle":
        drawShape(point);
        break;
      case "select":
        if (isResizing) {
          resize(point);
        }
        break;
    }
  };

  // 마우스 업 이벤트 핸들러
  const handleMouseUp = () => {
    switch (tool) {
      case "draw":
        stopDrawing();
        break;
      case "pan":
        stopPanning();
        break;
      case "eraser":
        stopErasing();
        break;
      case "rectangle":
      case "diamond":
      case "circle":
        stopShapeDrawing();
        break;
      case "select":
        if (isResizing) {
          stopResizing();
        }
        break;
    }
  };

  // 키보드 단축키 처리 (Undo/Redo, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }
      // Redo: Ctrl+Y
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
        return;
      }
      // Backspace 키로 선택된 요소 삭제
      if (e.key === "Backspace" && (selectedPathIds.length > 0 || selectedShapeIds.length > 0)) {
        e.preventDefault();

        // 삭제할 데이터 백업 (히스토리용)
        const pathsToDelete = paths.filter((path) => selectedPathIds.includes(path.id));
        const shapesToDelete = shapes.filter((shape) => selectedShapeIds.includes(shape.id));

        // 요소 삭제
        if (selectedPathIds.length > 0) {
          removePaths(selectedPathIds);
        }
        if (selectedShapeIds.length > 0) {
          removeShapes(selectedShapeIds);
        }

        // 히스토리에 저장
        if (pathsToDelete.length > 0 || shapesToDelete.length > 0) {
          saveEraseAction(pathsToDelete, shapesToDelete);
        }

        // 선택 해제
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    canUndo,
    canRedo,
    undo,
    redo,
    selectedPathIds,
    selectedShapeIds,
    paths,
    shapes,
    removePaths,
    removeShapes,
    clearSelection,
    saveEraseAction,
  ]);

  return (
    <CanvasContainer>
      <CanvasLayer
        ref={backgroundCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        $tool={tool}
        $isPanning={isPanning}
      />
      <CanvasLayer
        ref={foregroundCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        $tool={tool}
        $isPanning={isPanning}
        style={currentPath || currentShape ? { display: "block" } : { display: "none" }}
      />
    </CanvasContainer>
  );
};

export default Canvas;
