import { useRef, useEffect, useCallback, useMemo, type RefObject } from "react";
import styled from "styled-components";
import { useToolStore } from "../store/toolStore";
import { useDraw } from "../hooks/useDraw";
import { useEraser } from "../hooks/useEraser";
import { usePan } from "../hooks/usePan";
import { useShape } from "../hooks/useShape";
import { useSelect } from "../hooks/useSelect";
import { useResize } from "../hooks/useResize";
import { useMove } from "../hooks/useMove";
import { useText } from "../hooks/useText";
import type { Point, Tool } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { useCanvas } from "../hooks/useCanvas";
import { useZoom } from "../hooks/useZoom";
import TextInput from "./TextInput";

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const CanvasLayer = styled.canvas<{ $tool: Tool; $isPanning: boolean; $isMoving: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: ${(props) => {
    switch (props.$tool) {
      case "pan":
        return props.$isPanning ? "grabbing" : "grab";
      case "eraser":
        return "cell";
      case "select":
        return props.$isMoving ? "grabbing" : "pointer";
      default:
        return "crosshair";
    }
  }};
`;

type CanvasProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

const Canvas = ({ containerRef }: CanvasProps) => {
  const { tool, isPanning } = useToolStore();
  const {
    zoom,
    pan,
    currentPath,
    currentShape,
    paths,
    shapes,
    texts,
    selectedPathIds,
    selectedShapeIds,
    selectedTextIds,
    removePaths,
    removeShapes,
    removeTexts,
    clearSelection,
  } = useCanvasStore();
  const { canUndo, undo, canRedo, redo, saveEraseAction } = useHistoryStore();

  // 각 기능별 훅
  const { startDrawing, draw, stopDrawing } = useDraw();
  const { startErasing, erase, stopErasing } = useEraser();
  const { startPanning, doPanning, stopPanning } = usePan();
  const { startShapeDrawing, drawShape, stopShapeDrawing } = useShape();
  const { isDragSelecting, startDragSelect, updateDragSelect, stopDragSelect } = useSelect();
  const { isResizing, startResizing, resize, stopResizing } = useResize();
  const { isMoving, startMoving, move, stopMoving } = useMove();
  const { createPosition, editingTextId, startCreating, finishCreating } = useText();

  // 캔버스 레이어 참조
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);

  // 캔버스 렌더링 및 줌 설정
  useCanvas(containerRef, backgroundCanvasRef, foregroundCanvasRef, editingTextId);
  useZoom(backgroundCanvasRef);

  // 마우스 좌표 계산
  const getMousePos = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = currentPath || currentShape ? foregroundCanvasRef.current : backgroundCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();

      const x = (e.clientX - rect.left) / zoom + pan.x;
      const y = (e.clientY - rect.top) / zoom + pan.y;

      return { x, y };
    },
    [currentPath, currentShape, zoom, pan]
  );

  // 마우스 다운 이벤트 핸들러
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
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
          void (startResizing(point) || startMoving(point) || startDragSelect(point));
          break;
        case "text":
          void (!createPosition && startCreating(point));
          break;
      }
    },
    [
      tool,
      getMousePos,
      startDrawing,
      startPanning,
      startErasing,
      startShapeDrawing,
      startResizing,
      startMoving,
      startDragSelect,
      createPosition,
      startCreating,
    ]
  );

  // 마우스 이동 이벤트 핸들러
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
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
          void (isResizing && resize(point) || isMoving && move(point) || isDragSelecting && updateDragSelect(point));
          break;
      }
    },
    [
      tool,
      getMousePos,
      draw,
      doPanning,
      erase,
      drawShape,
      isResizing,
      resize,
      isMoving,
      move,
      isDragSelecting,
      updateDragSelect,
    ]
  );

  // 마우스 업 이벤트 핸들러
  const handleMouseUp = useCallback(() => {
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
        void (isResizing && stopResizing() || isMoving && stopMoving() || isDragSelecting && stopDragSelect());
        break;
    }
  }, [
    tool,
    stopDrawing,
    stopPanning,
    stopErasing,
    stopShapeDrawing,
    isResizing,
    stopResizing,
    isMoving,
    stopMoving,
    isDragSelecting,
    stopDragSelect,
  ]);

  // 키보드 단축키 처리 (Ctrl+Z, Ctrl+Y, Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        void (canUndo() && undo());
        return;
      }

      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        void (canRedo() && redo());
        return;
      }

      if (e.key === "Backspace") {
        // 텍스트 입력 중이면 Backspace는 텍스트 입력 필드에서 처리되도록 함
        if (editingTextId) {
          return;
        }

        e.preventDefault();

        const pathsToDelete = paths.filter((path) => selectedPathIds.includes(path.id));
        const shapesToDelete = shapes.filter((shape) => selectedShapeIds.includes(shape.id));
        const textsToDelete = texts.filter((text) => selectedTextIds.includes(text.id));

        removePaths(selectedPathIds);
        removeShapes(selectedShapeIds);
        removeTexts(selectedTextIds);

        // 히스토리 저장
        if (pathsToDelete.length > 0 || shapesToDelete.length > 0 || textsToDelete.length > 0) {
          saveEraseAction(pathsToDelete, shapesToDelete, textsToDelete);
        }

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
    selectedTextIds,
    paths,
    shapes,
    texts,
    removePaths,
    removeShapes,
    removeTexts,
    clearSelection,
    saveEraseAction,
    editingTextId,
  ]);

  // 편집 중인 텍스트
  const editingText = useMemo(() => {
    return editingTextId ? texts.find((t) => t.id === editingTextId) : null;
  }, [editingTextId, texts]);

  return (
    <CanvasContainer>
      <CanvasLayer
        ref={backgroundCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        $tool={tool}
        $isPanning={isPanning}
        $isMoving={isMoving}
      />
      <CanvasLayer
        ref={foregroundCanvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        $tool={tool}
        $isPanning={isPanning}
        $isMoving={isMoving}
        style={currentPath || currentShape ? { display: "block" } : { display: "none" }}
      />
      {createPosition && (
        <TextInput
          key={editingTextId || "new"}
          createPosition={createPosition}
          editingTextId={editingTextId}
          initialContent={editingText?.content || ""}
          fontSize={editingText?.fontSize}
          zoom={zoom}
          pan={pan}
          onFinish={finishCreating}
        />
      )}
    </CanvasContainer>
  );
};

export default Canvas;
