import type { Point, Shape, ShapeType } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useShape = () => {
  const { addShape, currentShape, setCurrentShape, updateCurrentShape } = useCanvasStore();
  const { saveShapeAction } = useHistoryStore();

  // 도형 그리기를 시작합니다.
  const startShapeDrawing = (point: Point, shapeType: ShapeType) => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
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

    setCurrentShape(newShape);
  };

  // 도형의 크기를 업데이트합니다.
  const drawShape = (point: Point) => {
    if (!currentShape) return;
    updateCurrentShape(point);
  };

  // 도형 그리기를 종료하고 도형을 저장합니다.
  const stopShapeDrawing = () => {
    if (!currentShape) return;

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
  };

  return {
    startShapeDrawing,
    drawShape,
    stopShapeDrawing,
  };
};
