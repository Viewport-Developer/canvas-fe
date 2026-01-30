import { useState, useCallback } from "react";
import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import {
  isPointOnPath,
  isPointInBoundingBox,
  isPointOnShape,
  removePathsFromYjs,
  removeShapesFromYjs,
  removeTextsFromYjs,
} from "../utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useEraser = () => {
  const { paths, pathsToErase, clearToErase, addToErase, shapes, shapesToErase, texts, textsToErase } =
    useCanvasStore();
  const { saveEraseAction } = useHistoryStore();

  const [isErasing, setIsErasing] = useState(false);

  // 주어진 점에서 지울 요소를 찾습니다.
  const eraseAtPoint = useCallback(
    (point: Point) => {
      const eraserRadius = CANVAS_CONFIG.ERASER_RADIUS;

      // 경로 지우기: 경로의 선에 가까운지 확인
      for (const path of paths) {
        if (pathsToErase.has(path.id)) continue;

        if (isPointOnPath(point, path, eraserRadius)) {
          addToErase("path", path.id);
        }
      }

      // 도형 지우기: 도형의 선에 가까운지 확인
      for (const shape of shapes) {
        if (shapesToErase.has(shape.id)) continue;

        if (isPointOnShape(point, shape, eraserRadius)) {
          addToErase("shape", shape.id);
        }
      }

      // 텍스트 지우기: 바운딩 박스 내부에 커서가 있는지 확인
      for (const text of texts) {
        if (textsToErase.has(text.id)) continue;

        if (isPointInBoundingBox(point, text.boundingBox)) {
          addToErase("text", text.id);
        }
      }
    },
    [paths, pathsToErase, shapes, shapesToErase, texts, textsToErase, addToErase]
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

    const pathsToEraseArray = [...pathsToErase];
    const shapesToEraseArray = [...shapesToErase];
    const textsToEraseArray = [...textsToErase];

    const pathsToEraseData = paths.filter((path) => pathsToErase.has(path.id));
    const shapesToEraseData = shapes.filter((shape) => shapesToErase.has(shape.id));
    const textsToEraseData = texts.filter((text) => textsToErase.has(text.id));

    removePathsFromYjs(pathsToEraseArray);
    removeShapesFromYjs(shapesToEraseArray);
    removeTextsFromYjs(textsToEraseArray);

    // 히스토리 저장
    if (pathsToErase.size > 0 || shapesToErase.size > 0 || textsToErase.size > 0) {
      saveEraseAction(pathsToEraseData, shapesToEraseData, textsToEraseData);
    }

    clearToErase();
  }, [pathsToErase, shapesToErase, textsToErase, paths, shapes, texts, saveEraseAction, clearToErase]);

  return {
    startErasing,
    erase,
    stopErasing,
  };
};
