import { useState } from "react";
import type { Point, Shape, ShapeType } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useShape = () => {
  const { addShape, currentShape, setCurrentShape, updateCurrentShape } =
    useCanvasStore();
  const { saveShapeAction } = useHistoryStore();

  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (point: Point, shapeType: ShapeType) => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      startPoint: point,
      endPoint: point,
      color: "#000000",
      width: 1,
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

  const draw = (point: Point) => {
    if (!currentShape || !isDrawing) return;
    updateCurrentShape(point);
  };

  const stopDrawing = () => {
    if (!currentShape || !isDrawing) return;

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
