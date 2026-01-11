import type { Point } from "../types";
import {
  isInEraserRange,
  isPointInBoundingBox,
  isPointInShape,
} from "../utils/geometry.utils";
import { useCanvasStore } from "../store/canvasStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export const useSelect = () => {
  const {
    paths,
    shapes,
    setSelectedPathIds,
    setSelectedShapeIds,
    clearSelection,
  } = useCanvasStore();

  const selectAtPoint = (point: Point) => {
    paths.forEach((path) => {
      const eraserRadius = CANVAS_CONFIG.ERASER_RADIUS;

      if (!isPointInBoundingBox(point, path.boundingBox)) {
        return;
      }

      const pathRadius = 2 / 2;
      const totalRadius = eraserRadius + pathRadius;

      const hasCollision = path.points.some((pathPoint) =>
        isInEraserRange(pathPoint, point, totalRadius)
      );

      if (hasCollision) {
        clearSelection();
        setSelectedPathIds([path.id]);
        return;
      }
    });

    shapes.forEach((shape) => {
      if (isPointInShape(point, shape)) {
        clearSelection();
        console.log("shape", shape.id);
        setSelectedShapeIds([shape.id]);
        return;
      }
    });
  };

  return {
    selectAtPoint,
  };
};
