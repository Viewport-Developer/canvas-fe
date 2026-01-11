import { useState } from "react";
import type { Point, Path } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { calculateDistance } from "../utils/geometry.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useDraw = () => {
  const { addPath, currentPath, setCurrentPath, addCurrentPathPoint } =
    useCanvasStore();
  const { saveDrawAction } = useHistoryStore();

  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [lastTime, setLastTime] = useState(0);

  const startDrawing = (point: Point) => {
    const newPath: Path = {
      id: `path-${Date.now()}`,
      points: [point],
      color: "#000000",
      width: 2,
    };

    setCurrentPath(newPath);
    setLastPoint(point);
    setLastTime(Date.now());
  };

  const draw = (point: Point) => {
    if (!currentPath) return;

    const now = Date.now();
    if (now - lastTime < CANVAS_CONFIG.DRAW_THROTTLE_MS) return;

    if (lastPoint) {
      const distance = calculateDistance(point, lastPoint);
      if (distance < CANVAS_CONFIG.MIN_POINT_DISTANCE) return;
    }

    setLastTime(now);
    setLastPoint(point);
    addCurrentPathPoint(point);
  };

  const stopDrawing = () => {
    if (!currentPath) return;

    addPath(currentPath);
    saveDrawAction(currentPath);
    setCurrentPath(null);
    setLastPoint(null);
  };

  return {
    startDrawing,
    draw,
    stopDrawing,
  };
};
