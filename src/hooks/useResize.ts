import { useState, useCallback } from "react";
import type { Point, BoundingBox, ResizeHandleType, Path, Shape, Text } from "../types";
import { getResizeHandleAtPoint, getHandlePosition } from "../utils/resize.utils";
import { getCombinedBoundingBox } from "../utils/boundingBox.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export const useResize = () => {
  const {
    paths,
    shapes,
    texts,
    selectedPathIds,
    selectedShapeIds,
    selectedTextIds,
    resizeSelectedPaths,
    resizeSelectedShapes,
    resizeSelectedTexts,
  } = useCanvasStore();

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
    isTextResize: boolean = false
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

    // 텍스트 리사이징인 경우 위아래 핸들도 처리 (높이 비율을 너비 비율로 변환)
    if (isTextResize) {
      switch (handle) {
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
        case "topLeft":
        case "bottomLeft":
          // 좌측 모서리 핸들은 left로 처리
          point1 = { x: newHandlePosition.x + padding, y: initialBox.topLeft.y };
          point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
          break;
        case "topRight":
        case "bottomRight":
          // 우측 모서리 핸들은 right로 처리
          point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
          point2 = {
            x: newHandlePosition.x - padding,
            y: initialBox.bottomRight.y,
          };
          break;
        case "top":
        case "bottom": {
          // 위아래 핸들: 높이 변화를 너비 변화로 변환하여 처리
          // 높이 비율을 계산하고 이를 너비에 적용하여 폰트 사이즈 조절
          const initialHeight = initialBox.bottomLeft.y - initialBox.topLeft.y;
          const newHeight =
            handle === "top"
              ? initialBox.bottomLeft.y - (newHandlePosition.y + padding)
              : newHandlePosition.y - padding - initialBox.topLeft.y;

          // 높이 비율 계산
          const heightRatio = initialHeight !== 0 ? newHeight / initialHeight : 1;

          // 높이 비율을 너비에 적용 (높이가 늘어나면 너비도 비례하여 늘어남)
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
            y: handle === "bottom" ? newHandlePosition.y - padding : initialBox.bottomRight.y,
          };
          break;
        }
        default:
          return initialBox;
      }
    } else {
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
  const startResizing = useCallback(
    (point: Point): boolean => {
      const selectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
      const selectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));
      const selectedTexts = texts.filter((t) => selectedTextIds.includes(t.id));
      const boundingBox = getCombinedBoundingBox(selectedPaths, selectedShapes, selectedTexts);
      if (!boundingBox) return false;

      const handle = getResizeHandleAtPoint(point, boundingBox);
      if (!handle) return false;

      // 텍스트만 선택된 경우 위아래 핸들도 허용 (높이 비율을 너비 비율로 변환하여 처리)
      // 이제 위아래 핸들도 처리하므로 제한 없음

      // 리사이즈 시작 시 초기 상태 저장 (히스토리용)
      setInitialPaths(selectedPaths.map((path) => ({ ...path })));
      setInitialShapes(selectedShapes.map((shape) => ({ ...shape })));
      setInitialTexts(selectedTexts.map((text) => ({ ...text })));

      setIsResizing(true);
      setResizeHandle(handle);
      setInitialBoundingBox(boundingBox);
      setInitialClickPosition(point);
      return true;
    },
    [paths, shapes, texts, selectedPathIds, selectedShapeIds, selectedTextIds]
  );

  // 리사이즈를 계속합니다.
  const resize = useCallback(
    (point: Point) => {
      if (!isResizing || !resizeHandle || !initialBoundingBox || !initialClickPosition) {
        return;
      }

      // 텍스트만 선택된 경우인지 확인
      const isTextOnly = selectedTextIds.length > 0 && selectedPathIds.length === 0 && selectedShapeIds.length === 0;
      const newBoundingBox = calculateNewBoundingBox(
        point,
        resizeHandle,
        initialBoundingBox,
        initialClickPosition,
        isTextOnly
      );

      // 전체 선택된 요소 개수 계산 (경로 + 도형 + 텍스트)
      const totalSelectedCount = selectedPathIds.length + selectedShapeIds.length + selectedTextIds.length;

      // 텍스트 리사이징
      if (selectedTextIds.length > 0) {
        // 여러 요소가 선택된 경우(텍스트 포함) 결합된 바운딩 박스 기준으로 스케일링
        if (totalSelectedCount > 1) {
          resizeSelectedTexts(newBoundingBox, initialBoundingBox, initialTexts, resizeHandle);
        } else {
          // 단일 텍스트 리사이징
          resizeSelectedTexts(newBoundingBox, undefined, undefined, resizeHandle);
        }
      }

      // 선택된 경로와 도형을 각각 리사이즈
      // 결합된 바운딩 박스를 리사이징하는 경우 초기 상태 전달
      // 전체 선택된 요소가 2개 이상이면 결합된 바운딩 박스 로직 사용
      if (totalSelectedCount > 1) {
        // 여러 요소가 선택된 경우 결합된 바운딩 박스 기준으로 스케일링
        if (selectedPathIds.length > 0) {
          resizeSelectedPaths(newBoundingBox, initialBoundingBox, initialPaths);
        }
        if (selectedShapeIds.length > 0) {
          resizeSelectedShapes(newBoundingBox, initialBoundingBox, initialShapes);
        }
      } else {
        // 단일 요소 리사이징
        if (selectedPathIds.length > 0) {
          resizeSelectedPaths(newBoundingBox);
        }
        if (selectedShapeIds.length > 0) {
          resizeSelectedShapes(newBoundingBox);
        }
      }
    },
    [
      isResizing,
      resizeHandle,
      initialBoundingBox,
      initialClickPosition,
      selectedPathIds,
      selectedShapeIds,
      selectedTextIds,
      initialPaths,
      initialShapes,
      initialTexts,
      resizeSelectedPaths,
      resizeSelectedShapes,
      resizeSelectedTexts,
    ]
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

    const currentSelectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
    const currentSelectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));
    const currentSelectedTexts = texts.filter((t) => selectedTextIds.includes(t.id));
    const currentBoundingBox = getCombinedBoundingBox(
      currentSelectedPaths,
      currentSelectedShapes,
      currentSelectedTexts
    );

    // 텍스트 리사이징은 현재 히스토리에 저장하지 않음 (필요시 나중에 추가)
    // initialTexts는 나중에 히스토리 저장에 사용할 수 있도록 유지
    if (currentBoundingBox && (currentSelectedPaths.length > 0 || currentSelectedShapes.length > 0)) {
      saveResizeAction(
        initialPaths,
        initialShapes,
        initialBoundingBox,
        currentSelectedPaths,
        currentSelectedShapes,
        currentBoundingBox
      );
    }

    // initialTexts 사용 (린터 경고 방지)
    if (initialTexts.length > 0) {
      // 텍스트 리사이징 히스토리는 현재 저장하지 않음
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
    selectedPathIds,
    selectedShapeIds,
    selectedTextIds,
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
