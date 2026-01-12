import { useState } from "react";
import type { Point, BoundingBox, ResizeHandleType, Path, Shape } from "../types";
import { getResizeHandleAtPoint, getHandlePosition } from "../utils/resize.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export const useResize = () => {
  const { paths, shapes, selectedPathIds, selectedShapeIds, resizeSelectedPaths, resizeSelectedShapes } =
    useCanvasStore();

  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandleType | null>(null);
  const [initialBoundingBox, setInitialBoundingBox] = useState<BoundingBox | null>(null);
  const [initialClickPosition, setInitialClickPosition] = useState<Point | null>(null);

  const [initialPaths, setInitialPaths] = useState<Path[]>([]);
  const [initialShapes, setInitialShapes] = useState<Shape[]>([]);

  const { saveResizeAction } = useHistoryStore();

  // 선택된 모든 요소의 결합된 바운딩 박스를 계산합니다.
  const getCombinedBoundingBox = (): BoundingBox | null => {
    const selectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
    const selectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));

    if (selectedPaths.length === 0 && selectedShapes.length === 0) {
      return null;
    }

    const allBoxes = [...selectedPaths.map((p) => p.boundingBox), ...selectedShapes.map((s) => s.boundingBox)];

    let minX = allBoxes[0].topLeft.x;
    let maxX = allBoxes[0].topRight.x;
    let minY = allBoxes[0].topLeft.y;
    let maxY = allBoxes[0].bottomLeft.y;

    allBoxes.forEach((box) => {
      minX = Math.min(minX, box.topLeft.x);
      maxX = Math.max(maxX, box.topRight.x);
      minY = Math.min(minY, box.topLeft.y);
      maxY = Math.max(maxY, box.bottomLeft.y);
    });

    return {
      topLeft: { x: minX, y: minY },
      topRight: { x: maxX, y: minY },
      bottomLeft: { x: minX, y: maxY },
      bottomRight: { x: maxX, y: maxY },
    };
  };

  // 새로운 바운딩 박스를 계산합니다.
  const calculateNewBoundingBox = (
    currentPoint: Point,
    handle: ResizeHandleType,
    initialBox: BoundingBox,
    initialClickPosition: Point
  ): BoundingBox => {
    // 초기 핸들 위치 계산
    const initialHandlePosition = getHandlePosition(handle, initialBox);

    // 패딩 계산 (초기 박스 기준)
    const initialWidth = initialBox.topRight.x - initialBox.topLeft.x;
    const initialHeight = initialBox.bottomLeft.y - initialBox.topLeft.y;
    const padding = Math.max(
      initialWidth * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
      initialHeight * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO
    );

    // 마우스 위치는 바운딩 박스의 핸들 위치를 따라가므로 오프셋 고려
    const offsetX = initialClickPosition.x - initialHandlePosition.x;
    const offsetY = initialClickPosition.y - initialHandlePosition.y;
    const newHandlePosition: Point = {
      x: currentPoint.x - offsetX,
      y: currentPoint.y - offsetY,
    };

    let point1: Point;
    let point2: Point;

    switch (handle) {
      case "topLeft":
        point1 = {
          x: newHandlePosition.x + padding,
          y: newHandlePosition.y + padding,
        };
        point2 = initialBox.bottomRight;
        break;
      case "topRight":
        point1 = {
          x: newHandlePosition.x - padding,
          y: newHandlePosition.y + padding,
        };
        point2 = initialBox.bottomLeft;
        break;
      case "bottomLeft":
        point1 = {
          x: newHandlePosition.x + padding,
          y: newHandlePosition.y - padding,
        };
        point2 = initialBox.topRight;
        break;
      case "bottomRight":
        point1 = {
          x: newHandlePosition.x - padding,
          y: newHandlePosition.y - padding,
        };
        point2 = initialBox.topLeft;
        break;
      case "top":
        point1 = { x: initialBox.topLeft.x, y: newHandlePosition.y + padding };
        point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
        break;
      case "bottom":
        point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
        point2 = {
          x: initialBox.bottomRight.x,
          y: newHandlePosition.y - padding,
        };
        break;
      case "left":
        point1 = { x: newHandlePosition.x + padding, y: initialBox.topLeft.y };
        point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
        break;
      case "right":
        point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
        point2 = {
          x: newHandlePosition.x - padding,
          y: initialBox.bottomRight.y,
        };
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

    // 너무 작아지면 반대편을 넘어가도록 자동 조정
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
  const startResizing = (point: Point): boolean => {
    const boundingBox = getCombinedBoundingBox();
    if (!boundingBox) return false;

    const handle = getResizeHandleAtPoint(point, boundingBox);
    if (!handle) return false;

    // 리사이즈 시작 시 초기 상태 저장 (히스토리용)
    const selectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
    const selectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));
    setInitialPaths(selectedPaths.map((path) => ({ ...path })));
    setInitialShapes(selectedShapes.map((shape) => ({ ...shape })));

    setIsResizing(true);
    setResizeHandle(handle);
    setInitialBoundingBox(boundingBox);
    setInitialClickPosition(point);
    return true;
  };

  // 리사이즈를 계속합니다.
  const resize = (point: Point) => {
    if (!isResizing || !resizeHandle || !initialBoundingBox || !initialClickPosition) {
      return;
    }

    const newBoundingBox = calculateNewBoundingBox(point, resizeHandle, initialBoundingBox, initialClickPosition);

    // 선택된 경로와 도형을 각각 리사이즈
    if (selectedPathIds.length > 0) {
      resizeSelectedPaths(newBoundingBox);
    }
    if (selectedShapeIds.length > 0) {
      resizeSelectedShapes(newBoundingBox);
    }
  };

  // 리사이즈를 종료합니다.
  const stopResizing = () => {
    if (!isResizing || !initialBoundingBox) {
      setIsResizing(false);
      setResizeHandle(null);
      setInitialBoundingBox(null);
      setInitialClickPosition(null);
      return;
    }

    const currentBoundingBox = getCombinedBoundingBox();
    if (currentBoundingBox) {
      const currentSelectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
      const currentSelectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));

      saveResizeAction(
        initialPaths,
        initialShapes,
        initialBoundingBox,
        currentSelectedPaths,
        currentSelectedShapes,
        currentBoundingBox
      );
    }

    setIsResizing(false);
    setResizeHandle(null);
    setInitialBoundingBox(null);
    setInitialClickPosition(null);
    setInitialPaths([]);
    setInitialShapes([]);
  };

  return {
    isResizing,
    startResizing,
    resize,
    stopResizing,
  };
};
