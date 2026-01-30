import type { Point, Shape } from "../types";
import { isPointInBoundingBox } from "./boundingBox.utils";
import { calculateDistance } from "./distance.utils";

// 점이 선분에 가까운지 확인합니다 (선의 두께 고려).
const isPointNearLine = (point: Point, p1: Point, p2: Point, threshold: number): boolean => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return calculateDistance(point, p1) <= threshold;
  }

  // 점에서 선분까지의 최단 거리 계산
  const t = Math.max(0, Math.min(1, ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSquared));
  const closestPoint = {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };

  return calculateDistance(point, closestPoint) <= threshold;
};

// 점이 사각형의 선에 가까운지 확인합니다.
const isPointOnRectangle = (point: Point, startPoint: Point, endPoint: Point, threshold: number): boolean => {
  const minX = Math.min(startPoint.x, endPoint.x);
  const maxX = Math.max(startPoint.x, endPoint.x);
  const minY = Math.min(startPoint.y, endPoint.y);
  const maxY = Math.max(startPoint.y, endPoint.y);

  const topLeft = { x: minX, y: minY };
  const topRight = { x: maxX, y: minY };
  const bottomLeft = { x: minX, y: maxY };
  const bottomRight = { x: maxX, y: maxY };

  return (
    isPointNearLine(point, topLeft, topRight, threshold) ||
    isPointNearLine(point, bottomLeft, bottomRight, threshold) ||
    isPointNearLine(point, topLeft, bottomLeft, threshold) ||
    isPointNearLine(point, topRight, bottomRight, threshold)
  );
};

// 점이 원/타원의 선에 가까운지 확인합니다.
const isPointOnCircle = (point: Point, startPoint: Point, endPoint: Point, threshold: number): boolean => {
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;
  const centerX = startPoint.x + width / 2;
  const centerY = startPoint.y + height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;

  // 타원 방정식: ((x - cx) / rx)^2 + ((y - cy) / ry)^2 = 1
  const dx = (point.x - centerX) / radiusX;
  const dy = (point.y - centerY) / radiusY;
  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

  // 타원의 둘레에 가까운지 확인
  return Math.abs(distanceFromCenter - 1) * Math.min(radiusX, radiusY) <= threshold;
};

// 점이 마름모의 선에 가까운지 확인합니다.
const isPointOnDiamond = (point: Point, startPoint: Point, endPoint: Point, threshold: number): boolean => {
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;
  const centerX = startPoint.x + width / 2;
  const centerY = startPoint.y + height / 2;

  const top = { x: centerX, y: startPoint.y };
  const right = { x: endPoint.x, y: centerY };
  const bottom = { x: centerX, y: endPoint.y };
  const left = { x: startPoint.x, y: centerY };

  return (
    isPointNearLine(point, top, right, threshold) ||
    isPointNearLine(point, right, bottom, threshold) ||
    isPointNearLine(point, bottom, left, threshold) ||
    isPointNearLine(point, left, top, threshold)
  );
};

// 점이 도형의 선에 가까운지 확인합니다 (선 클릭 선택용).
export const isPointOnShape = (point: Point, shape: Shape, eraserRadius: number): boolean => {
  if (!isPointInBoundingBox(point, shape.boundingBox)) {
    return false;
  }

  const shapeRadius = shape.width / 2;
  const totalRadius = shapeRadius + eraserRadius;

  // 도형 타입별로 선에 가까운지 확인
  switch (shape.type) {
    case "rectangle":
      return isPointOnRectangle(point, shape.startPoint, shape.endPoint, totalRadius);
    case "circle":
      return isPointOnCircle(point, shape.startPoint, shape.endPoint, totalRadius);
    case "diamond":
      return isPointOnDiamond(point, shape.startPoint, shape.endPoint, totalRadius);
    default:
      return false;
  }
};
