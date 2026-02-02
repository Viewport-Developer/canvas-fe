import { useRef, useEffect, useCallback, useMemo, type RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import styled from "styled-components";
import { useToolStore } from "../store/toolStore";
import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
import { useSelectionStore } from "../store/selectionStore";
import { useViewportStore } from "../store/viewportStore";
import { useDraw } from "../hooks/useDraw";
import { useEraser } from "../hooks/useEraser";
import { usePan } from "../hooks/usePan";
import { useShape } from "../hooks/useShape";
import { useSelect } from "../hooks/useSelect";
import { useResize } from "../hooks/useResize";
import { useMove } from "../hooks/useMove";
import { useText } from "../hooks/useText";
import type { Point, Tool } from "../types";
import { useHistoryStore } from "../store/historyStore";
import { useCanvas } from "../hooks/useCanvas";
import { useZoom } from "../hooks/useZoom";
import { useYjsConnectionStore } from "../store/yjsStore";
import { removePathsFromYjs, removeShapesFromYjs, removeTextsFromYjs } from "../utils";
import TextInput from "./TextInput";
import RemoteCursors from "./RemoteCursors";

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
  const [tool, isPanning] = useToolStore(useShallow((s) => [s.tool, s.isPanning]));
  const [zoom, pan] = useViewportStore(useShallow((s) => [s.zoom, s.pan]));
  const [paths, currentPaths] = usePathStore(useShallow((s) => [s.paths, s.currentPaths]));
  const [shapes, currentShapes] = useShapeStore(useShallow((s) => [s.shapes, s.currentShapes]));
  const [texts, currentTexts] = useTextStore(useShallow((s) => [s.texts, s.currentTexts]));
  const [selectedPaths, selectedShapes, selectedTexts, clearSelection] = useSelectionStore(
    useShallow((s) => [s.selectedPaths, s.selectedShapes, s.selectedTexts, s.clearSelection])
  );
  const [canUndo, undo, canRedo, redo, saveEraseAction] = useHistoryStore(
    useShallow((s) => [s.canUndo, s.undo, s.canRedo, s.redo, s.saveEraseAction])
  );

  // 각 기능별 훅
  const { startDrawing, draw, stopDrawing } = useDraw();
  const { startErasing, erase, stopErasing } = useEraser();
  const { startPanning, doPanning, stopPanning } = usePan();
  const { startShapeDrawing, drawShape, stopShapeDrawing } = useShape();
  const { isDragSelecting, startDragSelect, updateDragSelect, stopDragSelect } = useSelect();
  const { isResizing, startResizing, resize, stopResizing } = useResize();
  const { isMoving, startMoving, move, stopMoving } = useMove();
  const { createPosition, editingTextId, startTexting, finishTexting, updateText } = useText();

  // 캔버스 레이어 참조
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundCanvasRef = useRef<HTMLCanvasElement>(null);

  // 캔버스 렌더링 및 줌 설정
  useCanvas(containerRef, backgroundCanvasRef, foregroundCanvasRef, editingTextId);
  useZoom(backgroundCanvasRef);

  const [updateCursorPosition] = useYjsConnectionStore(useShallow((s) => [s.updateCursorPosition]));

  // 마우스 좌표 계산
  const getMousePos = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = backgroundCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();

      const x = (e.clientX - rect.left) / zoom + pan.x;
      const y = (e.clientY - rect.top) / zoom + pan.y;

      return { x, y };
    },
    [zoom, pan],
  );

  // 마우스 다운 이벤트 핸들러
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const point = getMousePos(e);

      // 클릭 시에도 커서 위치를 상대방에게 공유
      updateCursorPosition(point);

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
          void (!createPosition && startTexting(point));
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
      startTexting,
      updateCursorPosition,
    ],
  );

  // 마우스 이동 이벤트 핸들러
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const point = getMousePos(e);

      // 커서 위치 업데이트 (y.js awareness)
      updateCursorPosition(point);

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
          void (
            (isResizing && resize(point)) ||
            (isMoving && move(point)) ||
            (isDragSelecting && updateDragSelect(point))
          );
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
      updateCursorPosition,
    ],
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
        void ((isResizing && stopResizing()) || (isMoving && stopMoving()) || (isDragSelecting && stopDragSelect()));
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

        const pathsToDelete = paths.filter((path) => selectedPaths.has(path.id));
        const shapesToDelete = shapes.filter((shape) => selectedShapes.has(shape.id));
        const textsToDelete = texts.filter((text) => selectedTexts.has(text.id));

        removePathsFromYjs([...selectedPaths]);
        removeShapesFromYjs([...selectedShapes]);
        removeTextsFromYjs([...selectedTexts]);

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
    selectedPaths,
    selectedShapes,
    selectedTexts,
    paths,
    shapes,
    texts,
    clearSelection,
    saveEraseAction,
    editingTextId,
  ]);

  // 편집 중인 텍스트
  const editingText = useMemo(() => {
    return editingTextId ? texts.find((t) => t.id === editingTextId) : null;
  }, [editingTextId, texts]);

  // 마우스가 캔버스를 벗어날 때 커서 위치 초기화
  const handleMouseLeave = useCallback(() => {
    updateCursorPosition(null);
  }, [updateCursorPosition]);

  return (
    <CanvasContainer onMouseLeave={handleMouseLeave}>
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
        style={currentPaths.length > 0 || currentShapes.length > 0 || currentTexts.length > 0 ? { display: "block" } : { display: "none" }}
      />
      <RemoteCursors canvasRef={backgroundCanvasRef} zoom={zoom} pan={pan} />
      {createPosition && (
        <TextInput
          key={editingTextId || "new"}
          createPosition={createPosition}
          editingTextId={editingTextId}
          initialContent={editingText?.content || ""}
          fontSize={editingText?.fontSize}
          zoom={zoom}
          pan={pan}
          onFinish={finishTexting}
          onChange={(content) => updateText(content, zoom)}
        />
      )}
    </CanvasContainer>
  );
};

export default Canvas;
