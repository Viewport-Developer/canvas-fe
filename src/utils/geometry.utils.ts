import type { Point } from "../types";

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const isInEraserRange = (
  point: Point,
  eraserPoint: Point,
  radius: number
): boolean => {
  return calculateDistance(point, eraserPoint) < radius;
};
