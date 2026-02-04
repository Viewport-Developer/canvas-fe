import { useEffect, useCallback, type RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  clearCanvas,
  drawAllPaths,
  drawAllShapes,
  drawAllTexts,
  drawSelectionBox,
  drawDragSelectionBox,
  applyCanvasZoom,
  restoreCanvas,
  getCombinedBoundingBox,
} from "../utils";
import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
import { useEraserStore } from "../store/eraserStore";
import { useSelectionStore } from "../store/selectionStore";
import { useViewportStore } from "../store/viewportStore";

export const useCanvas = (
  containerRef: RefObject<HTMLDivElement | null>,
  backgroundCanvasRef: RefObject<HTMLCanvasElement | null>,
  foregroundCanvasRef: RefObject<HTMLCanvasElement | null>,
  editingTextId: string | null
) => {
  const [paths, currentPaths] = usePathStore(useShallow((s) => [s.paths, s.currentPaths]));
  const [shapes, currentShapes] = useShapeStore(useShallow((s) => [s.shapes, s.currentShapes]));
  const [texts, currentTexts] = useTextStore(useShallow((s) => [s.texts, s.currentTexts]));
  const [pathsToErase, shapesToErase, textsToErase] = useEraserStore(
    useShallow((s) => [s.pathsToErase, s.shapesToErase, s.textsToErase])
  );
  const [selectedPaths, selectedShapes, selectedTexts, isDragSelecting, dragStartPoint, dragEndPoint] =
    useSelectionStore(
      useShallow((s) => [
        s.selectedPaths,
        s.selectedShapes,
        s.selectedTexts,
        s.isDragSelecting,
        s.dragStartPoint,
        s.dragEndPoint,
      ])
    );
  const [zoom, pan] = useViewportStore(useShallow((s) => [s.zoom, s.pan]));

  // 백그라운드 캔버스를 다시 그립니다.
  const redrawBackground = useCallback(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height);

    applyCanvasZoom(ctx, zoom, pan.x, pan.y);

    drawAllPaths(ctx, paths, pathsToErase);
    drawAllShapes(ctx, shapes, shapesToErase);
    drawAllTexts(ctx, texts, textsToErase, editingTextId);

    // 선택된 항목의 바운딩 박스 그리기
    const selectedPathsArray = paths.filter((path) => selectedPaths.has(path.id));
    const selectedShapesArray = shapes.filter((shape) => selectedShapes.has(shape.id));
    const selectedTextsArray = texts.filter((text) => selectedTexts.has(text.id));
    const totalSelectedCount = selectedPathsArray.length + selectedShapesArray.length + selectedTextsArray.length;

    if (totalSelectedCount > 0) {
      if (isDragSelecting) {
        // 드래그중일 때는 개별 바운딩 박스 그리기 (드래그 박스는 아래에서 별도로 그림)
        for (const path of selectedPathsArray) {
          drawSelectionBox(ctx, path.boundingBox);
        }
        for (const shape of selectedShapesArray) {
          drawSelectionBox(ctx, shape.boundingBox);
        }
        for (const text of selectedTextsArray) {
          drawSelectionBox(ctx, text.boundingBox);
        }
      } else {
        // 드래그 선택이 끝나면 결합된 바운딩 박스 그리기
        const combinedBoundingBox = getCombinedBoundingBox(
          selectedPathsArray,
          selectedShapesArray,
          selectedTextsArray
        );
        if (combinedBoundingBox) {
          drawSelectionBox(ctx, combinedBoundingBox);
        }
      }
    }

    // 드래그 박스 그리기 (선택된 요소가 있어도 드래그 중이면 항상 표시)
    if (isDragSelecting && dragStartPoint && dragEndPoint) {
      drawDragSelectionBox(ctx, dragStartPoint, dragEndPoint);
    }

    restoreCanvas(ctx);
  }, [
    backgroundCanvasRef,
    paths,
    shapes,
    texts,
    pathsToErase,
    shapesToErase,
    textsToErase,
    selectedPaths,
    selectedShapes,
    selectedTexts,
    isDragSelecting,
    dragStartPoint,
    dragEndPoint,
    zoom,
    pan,
    editingTextId,
  ]);

  // 포그라운드 캔버스를 다시 그립니다. (모든 클라이언트의 그리는 중인 path/shape/text)
  const redrawForeground = useCallback(() => {
    const canvas = foregroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height);

    if (currentPaths.length > 0 || currentShapes.length > 0 || currentTexts.length > 0) {
      applyCanvasZoom(ctx, zoom, pan.x, pan.y);

      drawAllPaths(ctx, currentPaths, new Set());
      drawAllShapes(ctx, currentShapes, new Set());
      drawAllTexts(ctx, currentTexts, new Set(), editingTextId);

      restoreCanvas(ctx);
    }
  }, [foregroundCanvasRef, currentPaths, currentShapes, currentTexts, zoom, pan, editingTextId]);

  // 캔버스 크기를 컨테이너에 맞춥니다.
  useEffect(() => {
    const updateSize = () => {
      if (backgroundCanvasRef.current && containerRef.current && foregroundCanvasRef.current) {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        backgroundCanvasRef.current.width = width;
        backgroundCanvasRef.current.height = height;

        foregroundCanvasRef.current.width = width;
        foregroundCanvasRef.current.height = height;

        redrawBackground();
        redrawForeground();
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [backgroundCanvasRef, foregroundCanvasRef, containerRef, redrawBackground, redrawForeground]);

  useEffect(() => {
    redrawBackground();
  }, [redrawBackground]);

  useEffect(() => {
    redrawForeground();
  }, [redrawForeground]);
};
