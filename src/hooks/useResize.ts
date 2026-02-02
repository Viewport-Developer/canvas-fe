import { useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import type { Point, BoundingBox, ResizeHandleType, Path, Shape, Text } from "../types";
import { getResizeHandleAtPoint, getCombinedBoundingBox, calculateNewBoundingBox } from "../utils";
import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
import { useSelectionStore } from "../store/selectionStore";
import { useResizeStore } from "../store/resizeStore";
import { useHistoryStore } from "../store/historyStore";

export const useResize = () => {
  const [paths] = usePathStore(useShallow((s) => [s.paths]));
  const [shapes] = useShapeStore(useShallow((s) => [s.shapes]));
  const [texts] = useTextStore(useShallow((s) => [s.texts]));
  const [selectedPaths, selectedShapes, selectedTexts] = useSelectionStore(
    useShallow((s) => [s.selectedPaths, s.selectedShapes, s.selectedTexts])
  );
  const [resizeSelected] = useResizeStore(useShallow((s) => [s.resizeSelected]));

  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandleType | null>(null);
  const [initialBoundingBox, setInitialBoundingBox] = useState<BoundingBox | null>(null);
  const [initialClickPosition, setInitialClickPosition] = useState<Point | null>(null);

  const [initialPaths, setInitialPaths] = useState<Path[]>([]);
  const [initialShapes, setInitialShapes] = useState<Shape[]>([]);
  const [initialTexts, setInitialTexts] = useState<Text[]>([]);

  const [saveResizeAction] = useHistoryStore(useShallow((s) => [s.saveResizeAction]));

  // 리사이즈를 시작합니다.
  const startResizing = useCallback(
    (point: Point): boolean => {
      const selectedPathsArray = paths.filter((p) => selectedPaths.has(p.id));
      const selectedShapesArray = shapes.filter((s) => selectedShapes.has(s.id));
      const selectedTextsArray = texts.filter((t) => selectedTexts.has(t.id));
      const boundingBox = getCombinedBoundingBox(selectedPathsArray, selectedShapesArray, selectedTextsArray);
      if (!boundingBox) return false;

      const handle = getResizeHandleAtPoint(point, boundingBox);
      if (!handle) return false;

      // 리사이즈 시작 시 초기 상태 저장 (히스토리용)
      setInitialPaths(selectedPathsArray.map((path) => ({ ...path })));
      setInitialShapes(selectedShapesArray.map((shape) => ({ ...shape })));
      setInitialTexts(selectedTextsArray.map((text) => ({ ...text })));

      setIsResizing(true);
      setResizeHandle(handle);
      setInitialBoundingBox(boundingBox);
      setInitialClickPosition(point);
      return true;
    },
    [paths, shapes, texts, selectedPaths, selectedShapes, selectedTexts]
  );

  // 리사이즈를 계속합니다.
  const resize = useCallback(
    (point: Point) => {
      if (!isResizing || !resizeHandle || !initialBoundingBox || !initialClickPosition) {
        return;
      }

      // 텍스트가 포함된 선택: 결합 바운딩 박스를 텍스트처럼(가로 움직임만으로 비율) 계산
      const hasTextInSelection = selectedTexts.size > 0;
      const isTextLikeResize = hasTextInSelection;
      const newBoundingBox = calculateNewBoundingBox(
        point,
        resizeHandle,
        initialBoundingBox,
        initialClickPosition,
        isTextLikeResize
      );

      // 단일/다중 구분 없이 결합 바운딩 박스 로직만 사용 (단일은 결합 박스에 하나만 있는 경우)
      if (selectedPaths.size > 0) {
        resizeSelected({
          type: "path",
          newBoundingBox,
          initialBoundingBox,
          initialItems: initialPaths,
        });
      }
      if (selectedShapes.size > 0) {
        resizeSelected({
          type: "shape",
          newBoundingBox,
          initialBoundingBox,
          initialItems: initialShapes,
        });
      }
      if (selectedTexts.size > 0) {
        resizeSelected({
          type: "text",
          newBoundingBox,
          initialBoundingBox,
          initialItems: initialTexts,
          resizeHandle,
        });
      }
    },
    [
      isResizing,
      resizeHandle,
      initialBoundingBox,
      initialClickPosition,
      selectedPaths,
      selectedShapes,
      selectedTexts,
      initialPaths,
      initialShapes,
      initialTexts,
      resizeSelected,
    ]
  );

  // 리사이즈를 종료합니다.
  const stopResizing = useCallback(() => {
    if (!isResizing || !initialBoundingBox) {
      setIsResizing(false);
      setResizeHandle(null);
      setInitialBoundingBox(null);
      setInitialClickPosition(null);
      return;
    }

    const currentSelectedPaths = paths.filter((p) => selectedPaths.has(p.id));
    const currentSelectedShapes = shapes.filter((s) => selectedShapes.has(s.id));
    const currentSelectedTexts = texts.filter((t) => selectedTexts.has(t.id));
    const currentBoundingBox = getCombinedBoundingBox(
      currentSelectedPaths,
      currentSelectedShapes,
      currentSelectedTexts
    );

    // 리사이징 히스토리 저장 (경로, 도형, 텍스트 모두 포함)
    if (
      currentBoundingBox &&
      (currentSelectedPaths.length > 0 || currentSelectedShapes.length > 0 || currentSelectedTexts.length > 0)
    ) {
      saveResizeAction(
        initialPaths,
        initialShapes,
        initialTexts,
        initialBoundingBox,
        currentSelectedPaths,
        currentSelectedShapes,
        currentSelectedTexts,
        currentBoundingBox
      );
    }

    setIsResizing(false);
    setResizeHandle(null);
    setInitialBoundingBox(null);
    setInitialClickPosition(null);
    setInitialPaths([]);
    setInitialShapes([]);
    setInitialTexts([]);
  }, [
    isResizing,
    initialBoundingBox,
    paths,
    shapes,
    texts,
    selectedPaths,
    selectedShapes,
    selectedTexts,
    initialPaths,
    initialShapes,
    initialTexts,
    saveResizeAction,
  ]);

  return {
    isResizing,
    startResizing,
    resize,
    stopResizing,
  };
};
