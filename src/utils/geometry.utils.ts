import type { Point, BoundingBox } from "../types";

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

export const calculateBoundingBox = (points: Point[]): BoundingBox => {
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return {
    topLeft: { x: minX, y: minY },
    topRight: { x: maxX, y: minY },
    bottomLeft: { x: minX, y: maxY },
    bottomRight: { x: maxX, y: maxY },
  };
};

export const isPointInBoundingBox = (
  point: Point,
  boundingBox: BoundingBox
): boolean => {
  const minX = boundingBox.topLeft.x;
  const maxX = boundingBox.topRight.x;
  const minY = boundingBox.topLeft.y;
  const maxY = boundingBox.bottomLeft.y;

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
};
