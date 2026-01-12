import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import {
  isInEraserRange,
  isPointInBoundingBox,
  isPointOnShape,
} from "../utils/geometry.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";
import { useState } from "react";

export const useEraser = () => {
  const {
    paths,
    removePaths,
    pathsToErase,
    clearPathsToErase,
    addPathToErase,
    shapes,
    removeShapes,
    shapesToErase,
    clearShapesToErase,
    addShapeToErase,
  } = useCanvasStore();
  const { saveEraseAction } = useHistoryStore();

  const [isErasing, setIsErasing] = useState(false);

  const eraseAtPoint = (point: Point) => {
    const eraserRadius = CANVAS_CONFIG.ERASER_RADIUS;

    // Path 지우기
    paths.forEach((path) => {
      if (pathsToErase.includes(path.id)) return;

      if (!isPointInBoundingBox(point, path.boundingBox)) {
        return;
      }

      const pathRadius = 2 / 2;
      const totalRadius = eraserRadius + pathRadius;

      const hasCollision = path.points.some((pathPoint) =>
        isInEraserRange(pathPoint, point, totalRadius)
      );

      if (hasCollision) {
        addPathToErase(path.id);
      }
    });

    // Shape 지우기: 지우개 중심이 도형의 선에 가까운지 확인
    shapes.forEach((shape) => {
      if (shapesToErase.includes(shape.id)) return;

      if (isPointOnShape(point, shape)) {
        addShapeToErase(shape.id);
      }
    });
  };

  const startErasing = (point: Point) => {
    setIsErasing(true);
    eraseAtPoint(point);
  };

  const erase = (point: Point) => {
    if (!isErasing) return;
    eraseAtPoint(point);
  };

  const stopErasing = () => {
    setIsErasing(false);
    if (pathsToErase.length > 0 || shapesToErase.length > 0) {
      const pathsToEraseData = paths.filter((path) =>
        pathsToErase.includes(path.id)
      );
      const shapesToEraseData = shapes.filter((shape) =>
        shapesToErase.includes(shape.id)
      );

      removePaths(pathsToErase);
      removeShapes(shapesToErase);
      saveEraseAction(pathsToEraseData, shapesToEraseData);
      clearPathsToErase();
      clearShapesToErase();
    }
  };

  return {
    startErasing,
    erase,
    stopErasing,
  };
};
