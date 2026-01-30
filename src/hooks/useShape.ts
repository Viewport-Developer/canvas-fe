import { useCallback } from "react";
import type { Point, Shape, ShapeType } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { useHistoryStore } from "../store/historyStore";
import { getCurrentShapeFromAwareness, pushShapeToYjs, setCurrentShapeToAwareness } from "../utils";

export const useShape = () => {
  const { saveShapeAction } = useHistoryStore();

  // 도형 그리기를 시작합니다.
  const startShapeDrawing = useCallback((point: Point, shapeType: ShapeType) => {
    const newShape: Shape = {
      id: `shape-${crypto.randomUUID()}`,
      type: shapeType,
      startPoint: point,
      endPoint: point,
      color: CANVAS_CONFIG.DEFAULT_STROKE_COLOR,
      width: CANVAS_CONFIG.DEFAULT_STROKE_WIDTH,
      boundingBox: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 0 },
        bottomRight: { x: 0, y: 0 },
      },
    };

    setCurrentShapeToAwareness(newShape);
  }, []);

  // 도형의 크기를 업데이트합니다.
  const drawShape = useCallback((point: Point) => {
    const currentShape = getCurrentShapeFromAwareness();
    if (!currentShape) return;

    const newShape = {
      ...currentShape,
      endPoint: point,
    };

    setCurrentShapeToAwareness(newShape);
  }, []);

  // 도형 그리기를 종료하고 도형을 저장합니다.
  const stopShapeDrawing = useCallback(() => {
    const currentShape = getCurrentShapeFromAwareness();
    if (!currentShape) return;

    // 최종 바운딩 박스 계산
    const minX = Math.min(currentShape.startPoint.x, currentShape.endPoint.x);
    const maxX = Math.max(currentShape.startPoint.x, currentShape.endPoint.x);
    const minY = Math.min(currentShape.startPoint.y, currentShape.endPoint.y);
    const maxY = Math.max(currentShape.startPoint.y, currentShape.endPoint.y);

    const newShape: Shape = {
      ...currentShape,
      boundingBox: {
        topLeft: { x: minX, y: minY },
        topRight: { x: maxX, y: minY },
        bottomLeft: { x: minX, y: maxY },
        bottomRight: { x: maxX, y: maxY },
      },
    };

    pushShapeToYjs(newShape);
    setCurrentShapeToAwareness(null);
    saveShapeAction(newShape);
  }, [saveShapeAction]);

  return {
    startShapeDrawing,
    drawShape,
    stopShapeDrawing,
  };
};
