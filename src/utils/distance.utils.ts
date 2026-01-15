import type { Point } from "../types";

// 두 점 사이의 거리를 계산합니다.
export const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// 점이 지우개 범위 내에 있는지 확인합니다.
export const isInEraserRange = (point: Point, eraserPoint: Point, radius: number): boolean => {
  return calculateDistance(point, eraserPoint) < radius;
};
