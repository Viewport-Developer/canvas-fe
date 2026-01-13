import { useState } from "react";
import type { Point, Path, Shape } from "../types";
import { isPointInBoundingBox, getCombinedBoundingBox } from "../utils/boundingBox.utils";
import { getResizeHandleAtPoint } from "../utils/resize.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useMove = () => {
  const {
    paths,
    shapes,
    selectedPathIds,
    selectedShapeIds,
    moveSelectedPaths,
    moveSelectedShapes,
    setPaths,
    setShapes,
  } = useCanvasStore();

  const [isMoving, setIsMoving] = useState(false);
  const [initialClickPosition, setInitialClickPosition] = useState<Point | null>(null);
  const [initialPaths, setInitialPaths] = useState<Path[]>([]);
  const [initialShapes, setInitialShapes] = useState<Shape[]>([]);

  const { saveMoveAction } = useHistoryStore();

  // 이동을 시작합니다.
  const startMoving = (point: Point): boolean => {
    const selectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
    const selectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));
    const boundingBox = getCombinedBoundingBox(selectedPaths, selectedShapes);
    if (!boundingBox) return false;

    // 리사이즈 핸들을 클릭한 경우는 이동하지 않음
    const resizeHandle = getResizeHandleAtPoint(point, boundingBox);
    if (resizeHandle) return false;

    // 바운딩박스 내부를 클릭했는지 확인
    if (!isPointInBoundingBox(point, boundingBox)) return false;

    // 이동 시작 시 초기 상태 저장 (히스토리용)
    setInitialPaths(selectedPaths.map((path) => ({ ...path })));
    setInitialShapes(selectedShapes.map((shape) => ({ ...shape })));

    setIsMoving(true);
    setInitialClickPosition(point);
    return true;
  };

  // 이동을 계속합니다.
  const move = (point: Point) => {
    if (!isMoving || !initialClickPosition) {
      return;
    }

    // 초기 위치에서 현재 마우스 위치까지의 총 오프셋 계산
    const totalOffset: Point = {
      x: point.x - initialClickPosition.x,
      y: point.y - initialClickPosition.y,
    };

    // 초기 상태를 기준으로 새 위치 계산
    // 먼저 초기 상태로 되돌린 후 새 위치로 이동
    if (selectedPathIds.length > 0) {
      // 현재 경로를 초기 상태로 복원
      const restoredPaths = paths.map((path) => {
        if (!selectedPathIds.includes(path.id)) return path;
        const initialPath = initialPaths.find((p) => p.id === path.id);
        return initialPath || path;
      });
      setPaths(restoredPaths);

      // 새 위치로 이동
      moveSelectedPaths(totalOffset);
    }
    if (selectedShapeIds.length > 0) {
      // 현재 도형을 초기 상태로 복원
      const restoredShapes = shapes.map((shape) => {
        if (!selectedShapeIds.includes(shape.id)) return shape;
        const initialShape = initialShapes.find((s) => s.id === shape.id);
        return initialShape || shape;
      });
      setShapes(restoredShapes);

      // 새 위치로 이동
      moveSelectedShapes(totalOffset);
    }
  };

  // 이동을 종료합니다.
  const stopMoving = () => {
    if (!isMoving) {
      setIsMoving(false);
      setInitialClickPosition(null);
      return;
    }

    // 이동이 실제로 발생했는지 확인하고 히스토리에 저장
    const currentSelectedPaths = paths.filter((p) => selectedPathIds.includes(p.id));
    const currentSelectedShapes = shapes.filter((s) => selectedShapeIds.includes(s.id));

    // 초기 상태와 현재 상태가 다르면 히스토리에 저장
    const hasChanged =
      initialPaths.length > 0 ||
      initialShapes.length > 0 ||
      currentSelectedPaths.length > 0 ||
      currentSelectedShapes.length > 0;

    if (hasChanged) {
      saveMoveAction(initialPaths, initialShapes, currentSelectedPaths, currentSelectedShapes);
    }

    setIsMoving(false);
    setInitialClickPosition(null);
    setInitialPaths([]);
    setInitialShapes([]);
  };

  return {
    isMoving,
    startMoving,
    move,
    stopMoving,
  };
};
