import type { Point } from "../types";

// 두 점 사이의 거리를 계산합니다.
export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// 점이 지우개 범위 내에 있는지 확인합니다.
export const isInEraserRange = (point: Point, eraserPoint: Point, radius: number): boolean => {
  return calculateDistance(point, eraserPoint) < radius;
};
