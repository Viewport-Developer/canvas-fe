import { useEffect, type RefObject } from "react";
import {
  clearCanvas,
  drawAllPaths,
  drawPath,
  drawAllShapes,
  drawShape,
  drawAllTexts,
  drawSelectionBox,
  drawDragSelectionBox,
  applyCanvasZoom,
  restoreCanvas,
} from "../utils/canvas.utils";
import { getCombinedBoundingBox } from "../utils/boundingBox.utils";
import { useCanvasStore } from "../store/canvasStore";

export const useCanvas = (
  backgroundCanvasRef: RefObject<HTMLCanvasElement | null>,
  foregroundCanvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>
) => {
  const {
    paths,
    currentPath,
    shapes,
    currentShape,
    texts,
    pathsToErase,
    shapesToErase,
    selectedPathIds,
    selectedShapeIds,
    selectedTextIds,
    isDragSelecting,
    dragStartPoint,
    dragEndPoint,
    zoom,
    pan,
  } = useCanvasStore();

  // 백그라운드 캔버스를 다시 그립니다.
  const redrawBackground = () => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height);

    applyCanvasZoom(ctx, zoom, pan.x, pan.y);

    drawAllPaths(ctx, paths, pathsToErase);
    drawAllShapes(ctx, shapes, shapesToErase);
    drawAllTexts(ctx, texts);

    // 선택된 항목의 바운딩 박스 그리기
    const selectedPaths = paths.filter((path) => selectedPathIds.includes(path.id));
    const selectedShapes = shapes.filter((shape) => selectedShapeIds.includes(shape.id));
    const selectedTexts = texts.filter((text) => selectedTextIds.includes(text.id));
    const totalSelectedCount = selectedPaths.length + selectedShapes.length + selectedTexts.length;

    if (totalSelectedCount > 0) {
      if (isDragSelecting) {
        // 드래그 선택 중일 때는 개별 바운딩 박스 그리기
        selectedPaths.forEach((path) => {
          drawSelectionBox(ctx, path.boundingBox);
        });
        selectedShapes.forEach((shape) => {
          drawSelectionBox(ctx, shape.boundingBox);
        });
        selectedTexts.forEach((text) => {
          drawSelectionBox(ctx, text.boundingBox);
        });
      } else {
        // 드래그 선택이 끝나면 결합된 바운딩 박스 그리기
        const combinedBoundingBox = getCombinedBoundingBox(selectedPaths, selectedShapes, selectedTexts);
        if (combinedBoundingBox) {
          drawSelectionBox(ctx, combinedBoundingBox);
        }
      }
    }

    // 드래그 선택 박스 그리기
    if (isDragSelecting && dragStartPoint && dragEndPoint) {
      drawDragSelectionBox(ctx, dragStartPoint, dragEndPoint);
    }

    restoreCanvas(ctx);
  };

  // 포그라운드 캔버스를 다시 그립니다.
  const redrawForeground = () => {
    const canvas = foregroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height);

    if (currentPath || currentShape) {
      applyCanvasZoom(ctx, zoom, pan.x, pan.y);
      if (currentPath) {
        drawPath(ctx, currentPath, false);
      }
      if (currentShape) {
        drawShape(ctx, currentShape, false);
      }
      restoreCanvas(ctx);
    }
  };

  // 캔버스 크기를 컨테이너에 맞춥니다.
  useEffect(() => {
    const updateSize = () => {
      if (backgroundCanvasRef.current && containerRef.current) {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        backgroundCanvasRef.current.width = width;
        backgroundCanvasRef.current.height = height;

        if (foregroundCanvasRef.current) {
          foregroundCanvasRef.current.width = width;
          foregroundCanvasRef.current.height = height;
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [backgroundCanvasRef, foregroundCanvasRef, containerRef]);

  useEffect(() => {
    redrawBackground();
  }, [
    paths,
    shapes,
    texts,
    pathsToErase,
    shapesToErase,
    selectedPathIds,
    selectedShapeIds,
    selectedTextIds,
    zoom,
    pan,
    isDragSelecting,
    dragStartPoint,
    dragEndPoint,
  ]);

  useEffect(() => {
    redrawForeground();
  }, [currentPath, currentShape]);
};
