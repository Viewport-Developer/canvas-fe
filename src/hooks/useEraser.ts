import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { isInEraserRange } from "../utils/geometry.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useState } from "react";

export const useEraser = () => {
  const paths = useCanvasStore((state) => state.paths);
  const removePaths = useCanvasStore((state) => state.removePaths);
  const pathsToErase = useCanvasStore((state) => state.pathsToErase);
  const clearPathsToErase = useCanvasStore((state) => state.clearPathsToErase);
  const addPathToErase = useCanvasStore((state) => state.addPathToErase);

  const [isErasing, setIsErasing] = useState(false);

  const eraseAtPoint = (point: Point) => {
    const eraserRadius = CANVAS_CONFIG.ERASER_RADIUS;

    paths.forEach((path) => {
      if (pathsToErase.includes(path.id)) return;

      const pathRadius = 2 / 2;
      const totalRadius = eraserRadius + pathRadius;

      const hasCollision = path.points.some((pathPoint) =>
        isInEraserRange(pathPoint, point, totalRadius)
      );
      console.log(path.id, hasCollision);
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
    removePaths(pathsToErase);
    clearPathsToErase();
  };

  return {
    startErasing,
    erase,
    stopErasing,
  };
};
