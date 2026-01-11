import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { isInEraserRange, isPointInBoundingBox } from "../utils/geometry.utils";
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
  } = useCanvasStore();
  const { saveEraseAction } = useHistoryStore();

  const [isErasing, setIsErasing] = useState(false);

  const eraseAtPoint = (point: Point) => {
    const eraserRadius = CANVAS_CONFIG.ERASER_RADIUS;

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
    if (pathsToErase.length > 0) {
      const pathsToEraseData = paths.filter((path) =>
        pathsToErase.includes(path.id)
      );
      removePaths(pathsToErase);
      saveEraseAction(pathsToEraseData);
      clearPathsToErase();
    }
  };

  return {
    startErasing,
    erase,
    stopErasing,
  };
};
