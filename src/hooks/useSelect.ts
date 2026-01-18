import { useCallback } from "react";
import type { Point, BoundingBox } from "../types";
import { isPointInBoundingBox, doBoundingBoxesIntersect, calculateBoundingBox } from "../utils/boundingBox.utils";
import { isPointOnLine } from "../utils/distance.utils";
import { isPointOnShape } from "../utils/shapeLineDetection.utils";
import { useCanvasStore } from "../store/canvasStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

export const useSelect = () => {
  const {
    paths,
    shapes,
    texts,
    selectedPathIds,
    selectedShapeIds,
    selectedTextIds,
    setSelectedPathIds,
    setSelectedShapeIds,
    setSelectedTextIds,
    addSelectedPathId,
    addSelectedShapeId,
    addSelectedTextId,
    clearSelection,
    isDragSelecting,
    dragStartPoint,
    dragEndPoint,
    setIsDragSelecting,
    setDragStartPoint,
    setDragEndPoint,
  } = useCanvasStore();

  // 주어진 점에서 요소를 선택합니다.
  const selectAtPoint = useCallback(
    (point: Point) => {
      const eraserRadius = CANVAS_CONFIG.ERASER_RADIUS;
      let isSelected = false;

      // 경로 선택: 경로의 선에 가까운지 확인
      for (const path of paths) {
        if (selectedPathIds.includes(path.id)) continue;

        if (isPointOnLine(point, path, eraserRadius)) {
          clearSelection();
          setSelectedPathIds([path.id]);
          isSelected = true;
        }
      }

      // 도형 선택: 도형의 선에 가까운지 확인
      for (const shape of shapes) {
        if (selectedShapeIds.includes(shape.id)) continue;

        if (isPointOnShape(point, shape, eraserRadius)) {
          clearSelection();
          setSelectedShapeIds([shape.id]);
          isSelected = true;
        }
      }

      // 텍스트 선택: 텍스트의 바운딩 박스 내부인지 확인
      for (const text of texts) {
        if (selectedTextIds.includes(text.id)) continue;

        if (isPointInBoundingBox(point, text.boundingBox)) {
          clearSelection();
          setSelectedTextIds([text.id]);
          isSelected = true;
        }
      }

      // 아무것도 선택되지 않으면 선택 해제
      if (!isSelected) {
        clearSelection();
      }
    },
    [paths, shapes, texts,selectedPathIds, selectedShapeIds, selectedTextIds, clearSelection, setSelectedPathIds, setSelectedShapeIds, setSelectedTextIds]
  );

  // 드래그 선택을 시작합니다.
  const startDragSelect = useCallback(
    (point: Point) => {
      selectAtPoint(point);

      setIsDragSelecting(true);
      setDragStartPoint(point);
      setDragEndPoint(point);
    },
    [selectAtPoint, setIsDragSelecting, setDragStartPoint, setDragEndPoint]
  );

  // 드래그 선택을 업데이트합니다.
  const updateDragSelect = useCallback(
    (point: Point) => {
      if (!isDragSelecting || !dragStartPoint) {
        return;
      }

      setDragEndPoint(point);

      const selectionBox: BoundingBox = calculateBoundingBox([dragStartPoint, point]);

      // 바운딩 박스가 교차하는지 확인하고 추가
      for (const path of paths) {
        if (selectedPathIds.includes(path.id)) continue;

        if (doBoundingBoxesIntersect(selectionBox, path.boundingBox)) {
          addSelectedPathId(path.id);
        }
      }

      for (const shape of shapes) {
        if (selectedShapeIds.includes(shape.id)) continue;

        if (doBoundingBoxesIntersect(selectionBox, shape.boundingBox)) {
          addSelectedShapeId(shape.id);
        }
      }

      for (const text of texts) {
        if (selectedTextIds.includes(text.id)) continue;
        
        if (doBoundingBoxesIntersect(selectionBox, text.boundingBox)) {
          addSelectedTextId(text.id);
        }
      }
    },
    [
      isDragSelecting,
      dragStartPoint,
      paths,
      shapes,
      texts,
      selectedPathIds,
      selectedShapeIds,
      selectedTextIds,
      addSelectedPathId,
      addSelectedShapeId,
      addSelectedTextId,
      setDragEndPoint,
    ]
  );

  // 드래그 선택을 종료합니다.
  const stopDragSelect = useCallback(() => {
    setIsDragSelecting(false);
    setDragStartPoint(null);
    setDragEndPoint(null);
  }, [setIsDragSelecting, setDragStartPoint, setDragEndPoint]);

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
