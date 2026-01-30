import { useState, useCallback } from "react";
import type { Point, BoundingBox, ResizeHandleType, Path, Shape, Text } from "../types";
import { getResizeHandleAtPoint, getHandlePosition, getCombinedBoundingBox, calculateBoundingBox } from "../utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export const useResize = () => {
  const { paths, shapes, texts, selectedPaths, selectedShapes, selectedTexts, resizeSelected } = useCanvasStore();

  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandleType | null>(null);
  const [initialBoundingBox, setInitialBoundingBox] = useState<BoundingBox | null>(null);
  const [initialClickPosition, setInitialClickPosition] = useState<Point | null>(null);

  const [initialPaths, setInitialPaths] = useState<Path[]>([]);
  const [initialShapes, setInitialShapes] = useState<Shape[]>([]);
  const [initialTexts, setInitialTexts] = useState<Text[]>([]);

  const { saveResizeAction } = useHistoryStore();

  // 새로운 바운딩 박스를 계산합니다.
  const calculateNewBoundingBox = (
    currentPoint: Point,
    handle: ResizeHandleType,
    initialBox: BoundingBox,
    initialClickPosition: Point,
    isTextResize: boolean = false,
  ): BoundingBox => {
    // 초기 핸들 위치 계산
    const initialHandlePosition = getHandlePosition(handle, initialBox);

    // 진짜 핸들 위치 계산
    const offsetX = initialClickPosition.x - initialHandlePosition.x;
    const offsetY = initialClickPosition.y - initialHandlePosition.y;
    const newHandlePosition: Point = {
      x: currentPoint.x - offsetX,
      y: currentPoint.y - offsetY,
    };

    // 패딩 계산
    const initialWidth = initialBox.topRight.x - initialBox.topLeft.x;
    const initialHeight = initialBox.bottomLeft.y - initialBox.topLeft.y;
    const padding = Math.max(
      initialWidth * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
      initialHeight * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
    );

    let point1: Point;
    let point2: Point;

    // 텍스트 리사이징인 경우 높이 비율을 너비 비율로 변환
    if (isTextResize) {
      switch (handle) {
        case "left":
        case "topLeft":
        case "bottomLeft":
          point1 = { x: newHandlePosition.x + padding, y: initialBox.topLeft.y };
          point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
          break;
        case "right":
        case "topRight":
        case "bottomRight":
          point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
          point2 = { x: newHandlePosition.x - padding, y: initialBox.bottomRight.y };
          break;
        case "top":
        case "bottom": {
          const initialHeight = initialBox.bottomLeft.y - initialBox.topLeft.y;
          const newHeight =
            handle === "top"
              ? initialBox.bottomLeft.y - (newHandlePosition.y + padding)
              : newHandlePosition.y - padding - initialBox.topLeft.y;

          // 높이 비율 계산
          const heightRatio = initialHeight !== 0 ? newHeight / initialHeight : 1;

          // 높이 비율을 너비에 적용
          const initialWidth = initialBox.topRight.x - initialBox.topLeft.x;
          const newWidth = initialWidth * heightRatio;

          // 중심점 기준으로 너비 확장/축소
          const centerX = (initialBox.topLeft.x + initialBox.topRight.x) / 2;
          point1 = {
            x: centerX - newWidth / 2,
            y: handle === "top" ? newHandlePosition.y + padding : initialBox.topLeft.y,
          };
          point2 = {
            x: centerX + newWidth / 2,
            y: handle === "top" ? initialBox.bottomRight.y : newHandlePosition.y - padding,
          };
          break;
        }
        default:
          return initialBox;
      }
      return calculateBoundingBox([point1, point2]);
    }
    switch (handle) {
      case "topLeft":
        point1 = { x: newHandlePosition.x + padding, y: newHandlePosition.y + padding };
        point2 = initialBox.bottomRight;
        break;
      case "topRight":
        point1 = { x: newHandlePosition.x - padding, y: newHandlePosition.y + padding };
        point2 = initialBox.bottomLeft;
        break;
      case "bottomLeft":
        point1 = { x: newHandlePosition.x + padding, y: newHandlePosition.y - padding };
        point2 = initialBox.topRight;
        break;
      case "bottomRight":
        point1 = { x: newHandlePosition.x - padding, y: newHandlePosition.y - padding };
        point2 = initialBox.topLeft;
        break;
      case "top":
        point1 = { x: initialBox.topLeft.x, y: newHandlePosition.y + padding };
        point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
        break;
      case "bottom":
        point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
        point2 = { x: initialBox.bottomRight.x, y: newHandlePosition.y - padding };
        break;
      case "left":
        point1 = { x: newHandlePosition.x + padding, y: initialBox.topLeft.y };
        point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
        break;
      case "right":
        point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
        point2 = { x: newHandlePosition.x - padding, y: initialBox.bottomRight.y };
        break;
      default:
        return initialBox;
    }

    let minX = Math.min(point1.x, point2.x);
    let maxX = Math.max(point1.x, point2.x);
    let minY = Math.min(point1.y, point2.y);
    let maxY = Math.max(point1.y, point2.y);

    // 최소 크기 보장
    const minSize = CANVAS_CONFIG.MIN_RESIZE_SIZE;
    const width = maxX - minX;
    const height = maxY - minY;

    // 너무 작아지면 반대편으로 넘어가도록 조정
    if (width < minSize) {
      const centerX = (minX + maxX) / 2;
      minX = centerX - minSize / 2;
      maxX = centerX + minSize / 2;
    }

    if (height < minSize) {
      const centerY = (minY + maxY) / 2;
      minY = centerY - minSize / 2;
      maxY = centerY + minSize / 2;
    }

    return {
      topLeft: { x: minX, y: minY },
      topRight: { x: maxX, y: minY },
      bottomLeft: { x: minX, y: maxY },
      bottomRight: { x: maxX, y: maxY },
    };
  };

  // 리사이즈를 시작합니다.
  const startResizing = useCallback(
    (point: Point): boolean => {
      const selectedPathsArray = paths.filter((p) => selectedPaths.has(p.id));
      const selectedShapesArray = shapes.filter((s) => selectedShapes.has(s.id));
      const selectedTextsArray = texts.filter((t) => selectedTexts.has(t.id));
      const boundingBox = getCombinedBoundingBox(selectedPathsArray, selectedShapesArray, selectedTextsArray);
      if (!boundingBox) return false;

      const handle = getResizeHandleAtPoint(point, boundingBox);
      if (!handle) return false;

      // 리사이즈 시작 시 초기 상태 저장 (히스토리용)
      setInitialPaths(selectedPathsArray.map((path) => ({ ...path })));
      setInitialShapes(selectedShapesArray.map((shape) => ({ ...shape })));
      setInitialTexts(selectedTextsArray.map((text) => ({ ...text })));

      setIsResizing(true);
      setResizeHandle(handle);
      setInitialBoundingBox(boundingBox);
      setInitialClickPosition(point);
      return true;
    },
    [paths, shapes, texts, selectedPaths, selectedShapes, selectedTexts],
  );

  // 리사이즈를 계속합니다.
  const resize = useCallback(
    (point: Point) => {
      if (!isResizing || !resizeHandle || !initialBoundingBox || !initialClickPosition) {
        return;
      }

      // 텍스트만 선택된 경우인지 확인
      const isTextOnly = selectedTexts.size > 0 && selectedPaths.size === 0 && selectedShapes.size === 0;
      const newBoundingBox = calculateNewBoundingBox(
        point,
        resizeHandle,
        initialBoundingBox,
        initialClickPosition,
        isTextOnly,
      );

      const totalSelectedCount = selectedPaths.size + selectedShapes.size + selectedTexts.size;

      // 텍스트 리사이징
      if (selectedTexts.size > 0) {
        // 여러 요소가 선택된 경우 결합된 바운딩 박스 기준으로 스케일링
        if (totalSelectedCount > 1) {
          resizeSelected({
            type: "text",
            newBoundingBox,
            initialBoundingBox,
            initialItems: initialTexts,
            resizeHandle,
          });
          return;
        }
        // 단일 요소 리사이징
        resizeSelected({ type: "text", newBoundingBox, resizeHandle });
      }

      if (totalSelectedCount > 1) {
        // 여러 요소가 선택된 경우 결합된 바운딩 박스 기준으로 스케일링
        if (selectedPaths.size > 0) {
          resizeSelected({
            type: "path",
            newBoundingBox,
            initialBoundingBox,
            initialItems: initialPaths,
          });
        }
        if (selectedShapes.size > 0) {
          resizeSelected({
            type: "shape",
            newBoundingBox,
            initialBoundingBox,
            initialItems: initialShapes,
          });
        }
        return;
      }
      // 단일 요소 리사이징
      if (selectedPaths.size > 0) {
        resizeSelected({ type: "path", newBoundingBox });
      }
      if (selectedShapes.size > 0) {
        resizeSelected({ type: "shape", newBoundingBox });
      }
    },
    [
      isResizing,
      resizeHandle,
      initialBoundingBox,
      initialClickPosition,
      selectedPaths,
      selectedShapes,
      selectedTexts,
      initialPaths,
      initialShapes,
      initialTexts,
      resizeSelected,
    ],
  );

  // 리사이즈를 종료합니다.
  const stopResizing = useCallback(() => {
    if (!isResizing || !initialBoundingBox) {
      setIsResizing(false);
      setResizeHandle(null);
      setInitialBoundingBox(null);
      setInitialClickPosition(null);
      return;
    }

    const currentSelectedPaths = paths.filter((p) => selectedPaths.has(p.id));
    const currentSelectedShapes = shapes.filter((s) => selectedShapes.has(s.id));
    const currentSelectedTexts = texts.filter((t) => selectedTexts.has(t.id));
    const currentBoundingBox = getCombinedBoundingBox(
      currentSelectedPaths,
      currentSelectedShapes,
      currentSelectedTexts,
    );

    // 리사이징 히스토리 저장 (경로, 도형, 텍스트 모두 포함)
    if (
      currentBoundingBox &&
      (currentSelectedPaths.length > 0 || currentSelectedShapes.length > 0 || currentSelectedTexts.length > 0)
    ) {
      saveResizeAction(
        initialPaths,
        initialShapes,
        initialTexts,
        initialBoundingBox,
        currentSelectedPaths,
        currentSelectedShapes,
        currentSelectedTexts,
        currentBoundingBox,
      );
    }

    setIsResizing(false);
    setResizeHandle(null);
    setInitialBoundingBox(null);
    setInitialClickPosition(null);
    setInitialPaths([]);
    setInitialShapes([]);
    setInitialTexts([]);
  }, [
    isResizing,
    initialBoundingBox,
    paths,
    shapes,
    texts,
    selectedPaths,
    selectedShapes,
    selectedTexts,
    initialPaths,
    initialShapes,
    initialTexts,
    saveResizeAction,
  ]);

  return {
    isResizing,
    startResizing,
    resize,
    stopResizing,
  };
};
