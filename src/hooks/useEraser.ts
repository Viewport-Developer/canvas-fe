import { useState, useCallback } from "react";
import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import {  isPointOnLine } from "../utils/distance.utils";
import { isPointInBoundingBox } from "../utils/boundingBox.utils";
import { isPointOnShape } from "../utils/shapeLineDetection.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

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
    texts,
    removeTexts,
    textsToErase,
    clearTextsToErase,
    addTextToErase,
  } = useCanvasStore();
  const { saveEraseAction } = useHistoryStore();

  const [isErasing, setIsErasing] = useState(false);

  // 주어진 점에서 지울 요소를 찾습니다.
  const eraseAtPoint = useCallback(
    (point: Point) => {
      const eraserRadius = CANVAS_CONFIG.ERASER_RADIUS;

      // 경로 지우기: 경로의 선에 가까운지 확인
      for (const path of paths) {
        if (pathsToErase.includes(path.id)) continue;

        if (isPointOnLine(point, path, eraserRadius)) {
          addPathToErase(path.id);
        }
      }

      // 도형 지우기: 도형의 선에 가까운지 확인
      for (const shape of shapes) {
        if (shapesToErase.includes(shape.id)) continue;

        if (isPointOnShape(point, shape, eraserRadius)) {
          addShapeToErase(shape.id);
        }
      }

      // 텍스트 지우기: 바운딩 박스 내부에 커서가 있는지 확인
      for (const text of texts) {
        if (textsToErase.includes(text.id)) continue;

        if (isPointInBoundingBox(point, text.boundingBox)) {
          addTextToErase(text.id);
        }
      }
    },
    [paths, pathsToErase, shapes, shapesToErase, texts, textsToErase, addPathToErase, addShapeToErase, addTextToErase]
  );

  // 지우기를 시작합니다.
  const startErasing = useCallback(
    (point: Point) => {
      setIsErasing(true);
      eraseAtPoint(point);
    },
    [eraseAtPoint]
  );

  // 지우기를 계속합니다.
  const erase = useCallback(
    (point: Point) => {
      if (!isErasing) return;
      eraseAtPoint(point);
    },
    [isErasing, eraseAtPoint]
  );

  // 지우기를 종료하고 요소를 삭제합니다.
  const stopErasing = useCallback(() => {
    setIsErasing(false);

    const pathsToEraseData = paths.filter((path) => pathsToErase.includes(path.id));
    const shapesToEraseData = shapes.filter((shape) => shapesToErase.includes(shape.id));
    const textsToEraseData = texts.filter((text) => textsToErase.includes(text.id));

    removePaths(pathsToErase);
    removeShapes(shapesToErase);
    removeTexts(textsToErase);

    // 히스토리 저장
    if (pathsToErase.length > 0 || shapesToErase.length > 0 || textsToErase.length > 0) {
      saveEraseAction(pathsToEraseData, shapesToEraseData, textsToEraseData);
    }

    clearPathsToErase();
    clearShapesToErase();
    clearTextsToErase();
  }, [
    pathsToErase,
    shapesToErase,
    textsToErase,
    paths,
    shapes,
    texts,
    removePaths,
    removeShapes,
    removeTexts,
    saveEraseAction,
    clearPathsToErase,
    clearShapesToErase,
    clearTextsToErase,
  ]);

  return {
    startErasing,
    erase,
    stopErasing,
  };
};
