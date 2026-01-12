import type { Point, Shape } from "../types";
import { isPointInBoundingBox } from "./boundingBox.utils";

// 도형 감지 유틸리티

// 점이 사각형 내부에 있는지 확인합니다.
const isPointInRectangle = (
  point: Point,
  startPoint: Point,
  endPoint: Point
): boolean => {
  const minX = Math.min(startPoint.x, endPoint.x);
  const maxX = Math.max(startPoint.x, endPoint.x);
  const minY = Math.min(startPoint.y, endPoint.y);
  const maxY = Math.max(startPoint.y, endPoint.y);

  return (
    point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  );
};

// 점이 원/타원 내부에 있는지 확인합니다.
const isPointInCircle = (
  point: Point,
  startPoint: Point,
  endPoint: Point
): boolean => {
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;
  const centerX = startPoint.x + width / 2;
  const centerY = startPoint.y + height / 2;
  const radiusX = Math.abs(width) / 2;
  const radiusY = Math.abs(height) / 2;

  // 타원 방정식: ((x - cx) / rx)^2 + ((y - cy) / ry)^2 <= 1
  const dx = (point.x - centerX) / radiusX;
  const dy = (point.y - centerY) / radiusY;
  return dx * dx + dy * dy <= 1;
};

// 점이 마름모 내부에 있는지 확인합니다 (외적을 이용한 방법).
const isPointInDiamond = (
  point: Point,
  startPoint: Point,
  endPoint: Point
): boolean => {
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;
  const centerX = startPoint.x + width / 2;
  const centerY = startPoint.y + height / 2;

  // 마름모의 4개 꼭짓점
  const top = { x: centerX, y: startPoint.y };
  const right = { x: endPoint.x, y: centerY };
  const bottom = { x: centerX, y: endPoint.y };
  const left = { x: startPoint.x, y: centerY };

  // 외적을 이용한 마름모 내부 판단 (4개의 삼각형으로 나누어 판단)
  const sign = (p1: Point, p2: Point, p3: Point) => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  };

  // 중심점을 기준으로 4개의 삼각형으로 나누어 판단
  const checkTriangle = (p1: Point, p2: Point, p3: Point) => {
    const d1 = sign(point, p1, p2);
    const d2 = sign(point, p2, p3);
    const d3 = sign(point, p3, p1);
    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  };

  // 중심점
  const center = { x: centerX, y: centerY };

  // 4개의 삼각형 중 하나라도 내부에 있으면 마름모 내부
  return (
    checkTriangle(top, right, center) ||
    checkTriangle(right, bottom, center) ||
    checkTriangle(bottom, left, center) ||
    checkTriangle(left, top, center)
  );
};

// 점이 도형 내부에 있는지 확인합니다.
export const isPointInShape = (point: Point, shape: Shape): boolean => {
  // 먼저 바운딩 박스 체크로 빠르게 필터링
  if (!isPointInBoundingBox(point, shape.boundingBox)) {
    return false;
  }

  // 도형 타입별로 실제 영역 내부인지 확인
  switch (shape.type) {
    case "rectangle":
      return isPointInRectangle(point, shape.startPoint, shape.endPoint);
    case "circle":
      return isPointInCircle(point, shape.startPoint, shape.endPoint);
    case "diamond":
      return isPointInDiamond(point, shape.startPoint, shape.endPoint);
    default:
      return false;
  }
};
