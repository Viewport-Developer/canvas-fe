import { useState } from "react";
import type { Point, Shape, ShapeType } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

// 도형 그리기 훅
// 사각형, 원, 마름모 등의 도형을 그리는 기능을 제공합니다.
export const useShape = () => {
  const { addShape, currentShape, setCurrentShape, updateCurrentShape } =
    useCanvasStore();
  const { saveShapeAction } = useHistoryStore();

  const [isDrawing, setIsDrawing] = useState(false);

  // 도형 그리기를 시작합니다.
  const startDrawing = (point: Point, shapeType: ShapeType) => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      startPoint: point,
      endPoint: point,
      color: "#000000",
      width: 2,
      boundingBox: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 0, y: 0 },
        bottomLeft: { x: 0, y: 0 },
        bottomRight: { x: 0, y: 0 },
      },
    };

    setCurrentShape(newShape);
    setIsDrawing(true);
  };

  // 도형의 크기를 업데이트합니다.
  const draw = (point: Point) => {
    if (!currentShape || !isDrawing) return;
    updateCurrentShape(point);
  };

  // 도형 그리기를 종료하고 도형을 저장합니다.
  const stopDrawing = () => {
    if (!currentShape || !isDrawing) return;

    // 최종 바운딩 박스 계산
    const minX = Math.min(currentShape.startPoint.x, currentShape.endPoint.x);
    const maxX = Math.max(currentShape.startPoint.x, currentShape.endPoint.x);
    const minY = Math.min(currentShape.startPoint.y, currentShape.endPoint.y);
    const maxY = Math.max(currentShape.startPoint.y, currentShape.endPoint.y);

    const finalShape: Shape = {
      ...currentShape,
      boundingBox: {
        topLeft: { x: minX, y: minY },
        topRight: { x: maxX, y: minY },
        bottomLeft: { x: minX, y: maxY },
        bottomRight: { x: maxX, y: maxY },
      },
    };

    addShape(finalShape);
    saveShapeAction(finalShape);
    setCurrentShape(null);
    setIsDrawing(false);
  };

  return {
    startDrawing,
    draw,
    stopDrawing,
  };
};
