import type { Point } from "../types";
import { isInEraserRange } from "../utils/distance.utils";
import { isPointInBoundingBox } from "../utils/boundingBox.utils";
import { isPointOnShape } from "../utils/shapeLineDetection.utils";
import { useCanvasStore } from "../store/canvasStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export const useSelect = () => {
  const { paths, shapes, setSelectedPathIds, setSelectedShapeIds, clearSelection } = useCanvasStore();

  // 주어진 점에서 요소를 선택합니다.
  const selectAtPoint = (point: Point) => {
    let isSelected = false;

    // 경로 선택: 경로의 선에 가까운지 확인
    for (const path of paths) {
      if (!isPointInBoundingBox(point, path.boundingBox)) {
        continue;
      }

      const pathRadius = path.width / 2; // 경로 선의 반지름
      const totalRadius = CANVAS_CONFIG.ERASER_RADIUS + pathRadius;

      const hasCollision = path.points.some((pathPoint) => isInEraserRange(pathPoint, point, totalRadius));

      if (hasCollision) {
        clearSelection();
        setSelectedPathIds([path.id]);
        isSelected = true;
        return;
      }
    }

    // 도형 선택: 도형의 선에 가까운지 확인
    for (const shape of shapes) {
      if (!isPointInBoundingBox(point, shape.boundingBox)) {
        continue;
      }

      if (isPointOnShape(point, shape)) {
        clearSelection();
        setSelectedShapeIds([shape.id]);
        isSelected = true;
        return;
      }
    }

    // 아무것도 선택되지 않으면 선택 해제
    if (!isSelected) {
      clearSelection();
    }
  };

  return {
    selectAtPoint,
  };
};
