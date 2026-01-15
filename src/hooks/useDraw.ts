import { useState, useCallback } from "react";
import type { Point, Path } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { calculateDistance } from "../utils/distance.utils";
import { calculateBoundingBox } from "../utils/boundingBox.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useDraw = () => {
  const { addPath, currentPath, setCurrentPath, addCurrentPathPoint } = useCanvasStore();
  const { saveDrawAction } = useHistoryStore();

  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [lastTime, setLastTime] = useState(0);

  // 그리기를 시작합니다.
  const startDrawing = useCallback(
    (point: Point) => {
      const newPath: Path = {
        id: `path-${Date.now()}`,
        points: [point],
        color: CANVAS_CONFIG.DEFAULT_STROKE_COLOR,
        width: CANVAS_CONFIG.DEFAULT_STROKE_WIDTH,
        boundingBox: {
          topLeft: { x: 0, y: 0 },
          topRight: { x: 0, y: 0 },
          bottomLeft: { x: 0, y: 0 },
          bottomRight: { x: 0, y: 0 },
        },
      };

      setCurrentPath(newPath);
      setLastPoint(point);
      setLastTime(Date.now());
    },
    [setCurrentPath]
  );

  // 그리기를 계속합니다.
  const draw = useCallback(
    (point: Point) => {
      if (!currentPath) return;

      const now = Date.now();
      // 스로틀링: 너무 빠른 업데이트 방지
      if (now - lastTime < CANVAS_CONFIG.DRAW_THROTTLE_MS) return;

      // 최소 거리 체크: 너무 가까운 포인트는 무시
      if (lastPoint) {
        const distance = calculateDistance(point, lastPoint);
        if (distance < CANVAS_CONFIG.MIN_POINT_DISTANCE) return;
      }

      setLastTime(now);
      setLastPoint(point);
      addCurrentPathPoint(point);
    },
    [currentPath, lastTime, lastPoint, addCurrentPathPoint]
  );

  // 그리기를 종료하고 경로를 저장합니다.
  const stopDrawing = useCallback(() => {
    if (!currentPath) return;

    // 최종 바운딩 박스 계산
    const finalPath: Path = {
      ...currentPath,
      boundingBox: calculateBoundingBox(currentPath.points),
    };

    addPath(finalPath);
    saveDrawAction(finalPath);
    setCurrentPath(null);
    setLastPoint(null);
  }, [currentPath, addPath, saveDrawAction, setCurrentPath]);

  return {
    startDrawing,
    draw,
    stopDrawing,
  };
};
