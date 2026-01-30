import { useState, useCallback } from "react";
import type { Point, Path } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import {
  calculateDistance,
  calculateBoundingBox,
  getCurrentPathFromAwareness,
  pushPathToYjs,
  setCurrentPathToAwareness,
} from "../utils";
import { useHistoryStore } from "../store/historyStore";

export const useDraw = () => {
  const { saveDrawAction } = useHistoryStore();

  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [lastTime, setLastTime] = useState(0);

  // 그리기를 시작합니다.
  const startDrawing = useCallback((point: Point) => {
    const newPath: Path = {
      id: `path-${crypto.randomUUID()}`,
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

    setCurrentPathToAwareness(newPath);
    setLastTime(Date.now());
    setLastPoint(point);
  }, []);

  // 그리기를 계속합니다.
  const draw = useCallback(
    (point: Point) => {
      // 스로틀링: 너무 빠른 업데이트 방지
      const now = Date.now();
      if (now - lastTime < CANVAS_CONFIG.DRAW_THROTTLE_MS) return;

      // 최소 거리 체크: 너무 가까운 포인트는 무시
      if (lastPoint) {
        const distance = calculateDistance(point, lastPoint);
        if (distance < CANVAS_CONFIG.MIN_POINT_DISTANCE) return;
      }

      const currentPath = getCurrentPathFromAwareness();
      if (!currentPath) return;

      const newPath = {
        ...currentPath,
        points: [...currentPath.points, point],
      };

      setCurrentPathToAwareness(newPath);
      setLastTime(now);
      setLastPoint(point);
    },
    [lastTime, lastPoint],
  );

  // 그리기를 종료하고 경로를 저장합니다.
  const stopDrawing = useCallback(() => {
    const currentPath = getCurrentPathFromAwareness();
    if (!currentPath) return;

    const newPath: Path = {
      ...currentPath,
      boundingBox: calculateBoundingBox(currentPath.points),
    };

    pushPathToYjs(newPath);
    setCurrentPathToAwareness(null);
    saveDrawAction(newPath);
    setLastPoint(null);
  }, [saveDrawAction]);

  return {
    startDrawing,
    draw,
    stopDrawing,
  };
};
