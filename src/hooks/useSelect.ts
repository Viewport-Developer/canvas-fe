import type { Point, BoundingBox } from "../types";
import { isInEraserRange } from "../utils/distance.utils";
import { isPointInBoundingBox, doBoundingBoxesIntersect, calculateBoundingBox } from "../utils/boundingBox.utils";
import { isPointOnShape } from "../utils/shapeLineDetection.utils";
import { useCanvasStore } from "../store/canvasStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export const useSelect = () => {
  const {
    paths,
    shapes,
    selectedPathIds,
    selectedShapeIds,
    setSelectedPathIds,
    setSelectedShapeIds,
    addSelectedPathId,
    addSelectedShapeId,
    clearSelection,
    isDragSelecting,
    dragStartPoint,
    dragEndPoint,
    setIsDragSelecting,
    setDragStartPoint,
    setDragEndPoint,
  } = useCanvasStore();

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

  // 드래그 선택을 시작합니다.
  const startDragSelect = (point: Point) => {
    selectAtPoint(point);

    setIsDragSelecting(true);
    setDragStartPoint(point);
    setDragEndPoint(point);
  };

  // 드래그 선택을 업데이트합니다.
  const updateDragSelect = (point: Point) => {
    if (!isDragSelecting || !dragStartPoint) {
      return;
    }

    setDragEndPoint(point);

    // 드래그 선택 박스 생성
    const selectionBox: BoundingBox = calculateBoundingBox([dragStartPoint, point]);

    // 경로 선택: 바운딩 박스가 교차하는지 확인하고 추가
    for (const path of paths) {
      // 이미 선택된 경로는 건너뜀
      if (selectedPathIds.includes(path.id)) {
        continue;
      }

      // 드래그 선택 박스와 교차하면 추가
      if (doBoundingBoxesIntersect(selectionBox, path.boundingBox)) {
        addSelectedPathId(path.id);
      }
    }

    // 도형 선택: 바운딩 박스가 교차하는지 확인하고 추가
    for (const shape of shapes) {
      // 이미 선택된 도형은 건너뜀
      if (selectedShapeIds.includes(shape.id)) {
        continue;
      }

      // 드래그 선택 박스와 교차하면 추가
      if (doBoundingBoxesIntersect(selectionBox, shape.boundingBox)) {
        addSelectedShapeId(shape.id);
      }
    }
  };

  // 드래그 선택을 종료합니다.
  const stopDragSelect = () => {
    setIsDragSelecting(false);
    setDragStartPoint(null);
    setDragEndPoint(null);
  };

  return {
    selectAtPoint,
    isDragSelecting,
    dragStartPoint,
    dragEndPoint,
    startDragSelect,
    updateDragSelect,
    stopDragSelect,
  };
};
