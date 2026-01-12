import type { Point, Shape } from "../types";
import { isPointInBoundingBox } from "./boundingBox.utils";
import { calculateDistance } from "./distance.utils";

// 점이 선분에 가까운지 확인합니다 (선의 두께 고려).
const isPointNearLineSegment = (point: Point, p1: Point, p2: Point, threshold: number): boolean => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // 선분이 점인 경우
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

  // 4개의 변 체크
  const topLeft = { x: minX, y: minY };
  const topRight = { x: maxX, y: minY };
  const bottomLeft = { x: minX, y: maxY };
  const bottomRight = { x: maxX, y: maxY };

  return (
    isPointNearLineSegment(point, topLeft, topRight, threshold) ||
    isPointNearLineSegment(point, bottomLeft, bottomRight, threshold) ||
    isPointNearLineSegment(point, topLeft, bottomLeft, threshold) ||
    isPointNearLineSegment(point, topRight, bottomRight, threshold)
  );
};

// 점이 원/타원의 선에 가까운지 확인합니다.
const isPointOnCircle = (point: Point, startPoint: Point, endPoint: Point, threshold: number): boolean => {
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;
  const centerX = startPoint.x + width / 2;
  const centerY = startPoint.y + height / 2;
  const radiusX = Math.abs(width) / 2;
  const radiusY = Math.abs(height) / 2;

  // 타원 방정식: ((x - cx) / rx)^2 + ((y - cy) / ry)^2 = 1
  const dx = (point.x - centerX) / radiusX;
  const dy = (point.y - centerY) / radiusY;
  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

  // 타원의 둘레에 가까운지 확인 (1에 가까운지)
  return Math.abs(distanceFromCenter - 1) * Math.min(radiusX, radiusY) <= threshold;
};

// 점이 마름모의 선에 가까운지 확인합니다.
const isPointOnDiamond = (point: Point, startPoint: Point, endPoint: Point, threshold: number): boolean => {
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;
  const centerX = startPoint.x + width / 2;
  const centerY = startPoint.y + height / 2;

  // 마름모의 4개 꼭짓점
  const top = { x: centerX, y: startPoint.y };
  const right = { x: endPoint.x, y: centerY };
  const bottom = { x: centerX, y: endPoint.y };
  const left = { x: startPoint.x, y: centerY };

  // 4개의 변 체크
  return (
    isPointNearLineSegment(point, top, right, threshold) ||
    isPointNearLineSegment(point, right, bottom, threshold) ||
    isPointNearLineSegment(point, bottom, left, threshold) ||
    isPointNearLineSegment(point, left, top, threshold)
  );
};

// 점이 도형의 선에 가까운지 확인합니다 (선 클릭 선택용).
export const isPointOnShape = (point: Point, shape: Shape): boolean => {
  if (!isPointInBoundingBox(point, shape.boundingBox)) {
    return false;
  }

  // 선의 두께를 고려한 임계값 (선의 반 두께 + 여유 공간)
  const threshold = shape.width / 2 + 5;

  // 도형 타입별로 선에 가까운지 확인
  switch (shape.type) {
    case "rectangle":
      return isPointOnRectangle(point, shape.startPoint, shape.endPoint, threshold);
    case "circle":
      return isPointOnCircle(point, shape.startPoint, shape.endPoint, threshold);
    case "diamond":
      return isPointOnDiamond(point, shape.startPoint, shape.endPoint, threshold);
    default:
      return false;
  }
};
