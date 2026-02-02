import { useState, useCallback } from "react";
import type { Point, Path, Shape, Text } from "../types";
import { isPointInBoundingBox, getCombinedBoundingBox, getResizeHandleAtPoint } from "../utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useMove = () => {
  const { paths, shapes, texts, selectedPaths, selectedShapes, selectedTexts, moveSelected } = useCanvasStore();

  const [isMoving, setIsMoving] = useState(false);
  const [prevPosition, setPrevPosition] = useState<Point | null>(null);
  const [initialPaths, setInitialPaths] = useState<Path[]>([]);
  const [initialShapes, setInitialShapes] = useState<Shape[]>([]);
  const [initialTexts, setInitialTexts] = useState<Text[]>([]);

  const { saveMoveAction } = useHistoryStore();

  // 이동을 시작합니다.
  const startMoving = useCallback(
    (point: Point): boolean => {
      const selectedPathsArray = paths.filter((p) => selectedPaths.has(p.id));
      const selectedShapesArray = shapes.filter((s) => selectedShapes.has(s.id));
      const selectedTextsArray = texts.filter((t) => selectedTexts.has(t.id));
      const boundingBox = getCombinedBoundingBox(selectedPathsArray, selectedShapesArray, selectedTextsArray);
      if (!boundingBox) return false;

      // 리사이즈 핸들을 클릭한 경우는 이동하지 않음
      const isResizeHandle = getResizeHandleAtPoint(point, boundingBox);
      if (isResizeHandle) return false;

      // 바운딩박스 내부를 클릭했는지 확인
      if (!isPointInBoundingBox(point, boundingBox)) return false;

      // 이동 시작 시 초기 상태 저장 (히스토리용)
      setInitialPaths(selectedPathsArray.map((path) => ({ ...path })));
      setInitialShapes(selectedShapesArray.map((shape) => ({ ...shape })));
      setInitialTexts(selectedTextsArray.map((text) => ({ ...text })));

      setIsMoving(true);
      setPrevPosition(point);
      return true;
    },
    [paths, shapes, texts, selectedPaths, selectedShapes, selectedTexts]
  );

  // 이동을 계속합니다.
  const move = useCallback(
    (point: Point) => {
      if (!isMoving || !prevPosition) {
        return;
      }

      const offset: Point = {
        x: point.x - prevPosition.x,
        y: point.y - prevPosition.y,
      };

      if (selectedPaths.size > 0) {
        moveSelected("path", offset);
      }
      if (selectedShapes.size > 0) {
        moveSelected("shape", offset);
      }
      if (selectedTexts.size > 0) {
        moveSelected("text", offset);
      }

      setPrevPosition(point);
    },
    [isMoving, prevPosition, selectedPaths, selectedShapes, selectedTexts, moveSelected]
  );

  // 이동을 종료합니다.
  const stopMoving = useCallback(() => {
    const hasChanged = initialPaths.length > 0 || initialShapes.length > 0 || initialTexts.length > 0;

    if (hasChanged) {
      const currentSelectedPaths = paths.filter((p) => selectedPaths.has(p.id));
      const currentSelectedShapes = shapes.filter((s) => selectedShapes.has(s.id));
      const currentSelectedTexts = texts.filter((t) => selectedTexts.has(t.id));

      saveMoveAction(
        initialPaths,
        initialShapes,
        initialTexts,
        currentSelectedPaths,
        currentSelectedShapes,
        currentSelectedTexts
      );
    }

    setIsMoving(false);
    setPrevPosition(null);
    setInitialPaths([]);
    setInitialShapes([]);
    setInitialTexts([]);
  }, [
    paths,
    shapes,
    texts,
    selectedPaths,
    selectedShapes,
    selectedTexts,
    initialPaths,
    initialShapes,
    initialTexts,
    saveMoveAction,
  ]);

  return {
    isMoving,
    startMoving,
    move,
    stopMoving,
  };
};
