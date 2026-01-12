import { useState } from "react";
import type {
  Point,
  BoundingBox,
  ResizeHandleType,
  Path,
  Shape,
} from "../types";
import {
  getResizeHandleAtPoint,
  getHandlePosition,
} from "../utils/resize.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

// 리사이즈 훅
// 선택된 요소의 크기를 조절하는 기능을 제공합니다.
export const useResize = () => {
  const {
    paths,
    shapes,
    selectedPathIds,
    selectedShapeIds,
    resizeSelectedPaths,
    resizeSelectedShapes,
  } = useCanvasStore();

  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandleType | null>(
    null
  );
  const [initialBoundingBox, setInitialBoundingBox] =
    useState<BoundingBox | null>(null);
  const [initialClickPosition, setInitialClickPosition] =
    useState<Point | null>(null);
  // 리사이즈 시작 시의 초기 상태 저장 (히스토리용)
  const [initialPaths, setInitialPaths] = useState<Path[]>([]);
  const [initialShapes, setInitialShapes] = useState<Shape[]>([]);

  const { saveResizeAction } = useHistoryStore();

  // 선택된 모든 요소의 결합된 바운딩 박스를 계산합니다.
  const getCombinedBoundingBox = (): BoundingBox | null => {
    const selectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
    const selectedShapes = shapes.filter((s) =>
      selectedShapeIds.includes(s.id)
    );

    if (selectedPaths.length === 0 && selectedShapes.length === 0) {
      return null;
    }

    const allBoxes = [
      ...selectedPaths.map((p) => p.boundingBox),
      ...selectedShapes.map((s) => s.boundingBox),
    ];

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
  // 마우스 위치와 리사이즈 핸들을 기반으로 새로운 크기를 계산합니다.
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

    // 마우스 위치는 바운딩 박스의 핸들 위치를 따라가므로, 오프셋 고려
    const offsetX = initialClickPosition.x - initialHandlePosition.x;
    const offsetY = initialClickPosition.y - initialHandlePosition.y;
    const newHandlePosition: Point = {
      x: currentPoint.x - offsetX,
      y: currentPoint.y - offsetY,
    };

    let point1: Point;
    let point2: Point;

    // 각 핸들을 잡았을 때, 마우스 위치는 바운딩 박스의 핸들 위치이고
    // 도형의 실제 좌표는 마우스 위치에서 패딩을 뺀 값
    switch (handle) {
      case "topLeft":
        // 마우스 위치 = 바운딩 박스의 좌상단 (패딩 포함)
        // 도형의 좌상단 = 마우스 위치 + 패딩
        point1 = {
          x: newHandlePosition.x + padding,
          y: newHandlePosition.y + padding,
        };
        point2 = initialBox.bottomRight;
        break;
      case "topRight":
        // 마우스 위치 = 바운딩 박스의 우상단 (패딩 포함)
        // 도형의 우상단 = 마우스 위치 - 패딩
        point1 = {
          x: newHandlePosition.x - padding,
          y: newHandlePosition.y + padding,
        };
        point2 = initialBox.bottomLeft;
        break;
      case "bottomLeft":
        // 마우스 위치 = 바운딩 박스의 좌하단 (패딩 포함)
        // 도형의 좌하단 = 마우스 위치 + 패딩 (x), 마우스 위치 - 패딩 (y)
        point1 = {
          x: newHandlePosition.x + padding,
          y: newHandlePosition.y - padding,
        };
        point2 = initialBox.topRight;
        break;
      case "bottomRight":
        // 마우스 위치 = 바운딩 박스의 우하단 (패딩 포함)
        // 도형의 우하단 = 마우스 위치 - 패딩
        point1 = {
          x: newHandlePosition.x - padding,
          y: newHandlePosition.y - padding,
        };
        point2 = initialBox.topLeft;
        break;
      case "top":
        // 마우스 위치 = 바운딩 박스의 상단 변 (패딩 포함)
        // 도형의 상단 = 마우스 위치 + 패딩
        point1 = { x: initialBox.topLeft.x, y: newHandlePosition.y + padding };
        point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
        break;
      case "bottom":
        // 마우스 위치 = 바운딩 박스의 하단 변 (패딩 포함)
        // 도형의 하단 = 마우스 위치 - 패딩
        point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
        point2 = {
          x: initialBox.bottomRight.x,
          y: newHandlePosition.y - padding,
        };
        break;
      case "left":
        // 마우스 위치 = 바운딩 박스의 좌측 변 (패딩 포함)
        // 도형의 좌측 = 마우스 위치 + 패딩
        point1 = { x: newHandlePosition.x + padding, y: initialBox.topLeft.y };
        point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
        break;
      case "right":
        // 마우스 위치 = 바운딩 박스의 우측 변 (패딩 포함)
        // 도형의 우측 = 마우스 위치 - 패딩
        point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
        point2 = {
          x: newHandlePosition.x - padding,
          y: initialBox.bottomRight.y,
        };
        break;
      default:
        return initialBox;
    }

    // 도형을 만들 때처럼 min/max를 계산해서 바운딩 박스 생성
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
  // @returns 리사이즈 핸들이 감지되면 true, 아니면 false
  const startResizing = (point: Point): boolean => {
    const boundingBox = getCombinedBoundingBox();
    if (!boundingBox) return false;

    const handle = getResizeHandleAtPoint(point, boundingBox);
    if (!handle) return false;

    // 리사이즈 시작 시 초기 상태 저장 (히스토리용)
    const selectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
    const selectedShapes = shapes.filter((s) =>
      selectedShapeIds.includes(s.id)
    );
    setInitialPaths(selectedPaths.map((path) => ({ ...path })));
    setInitialShapes(selectedShapes.map((shape) => ({ ...shape })));

    setIsResizing(true);
    setResizeHandle(handle);
    setInitialBoundingBox(boundingBox);
    // 실제 클릭 위치를 저장 (계산된 핸들 위치가 아닌)
    setInitialClickPosition(point);
    return true;
  };

  // 리사이즈를 계속합니다.
  const resize = (point: Point) => {
    if (
      !isResizing ||
      !resizeHandle ||
      !initialBoundingBox ||
      !initialClickPosition
    ) {
      return;
    }

    const newBoundingBox = calculateNewBoundingBox(
      point,
      resizeHandle,
      initialBoundingBox,
      initialClickPosition
    );

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

    // 리사이즈가 실제로 변경되었는지 확인
    const currentBoundingBox = getCombinedBoundingBox();
    if (currentBoundingBox) {
      const currentSelectedPaths = paths.filter((p) =>
        selectedPathIds.includes(p.id)
      );
      const currentSelectedShapes = shapes.filter((s) =>
        selectedShapeIds.includes(s.id)
      );

      // 바운딩 박스가 변경되었는지 확인
      const boundingBoxChanged =
        currentBoundingBox.topLeft.x !== initialBoundingBox.topLeft.x ||
        currentBoundingBox.topLeft.y !== initialBoundingBox.topLeft.y ||
        currentBoundingBox.topRight.x !== initialBoundingBox.topRight.x ||
        currentBoundingBox.bottomLeft.y !== initialBoundingBox.bottomLeft.y;

      // 변경사항이 있으면 히스토리에 저장
      if (boundingBoxChanged) {
        saveResizeAction(
          initialPaths,
          initialShapes,
          initialBoundingBox,
          currentSelectedPaths,
          currentSelectedShapes,
          currentBoundingBox
        );
      }
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
