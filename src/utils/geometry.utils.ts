import type { Point, BoundingBox, Shape } from "../types";

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

// 지우개 중심이 사각형 내부에 있는지 확인
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

// 지우개 중심이 원/타원 내부에 있는지 확인
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

// 지우개 중심이 삼각형 내부에 있는지 확인 (외적을 이용한 방법)
const isPointInTriangle = (
  point: Point,
  startPoint: Point,
  endPoint: Point
): boolean => {
  const width = endPoint.x - startPoint.x;
  const centerX = startPoint.x + width / 2;
  const topX = centerX;
  const topY = startPoint.y;
  const bottomLeftX = startPoint.x;
  const bottomLeftY = endPoint.y;
  const bottomRightX = endPoint.x;
  const bottomRightY = endPoint.y;

  // 외적을 이용한 삼각형 내부 판단
  const sign = (p1: Point, p2: Point, p3: Point) => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  };

  const d1 = sign(
    point,
    { x: topX, y: topY },
    { x: bottomLeftX, y: bottomLeftY }
  );
  const d2 = sign(
    point,
    { x: bottomLeftX, y: bottomLeftY },
    { x: bottomRightX, y: bottomRightY }
  );
  const d3 = sign(
    point,
    { x: bottomRightX, y: bottomRightY },
    { x: topX, y: topY }
  );

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
};

// 지우개 중심이 도형 내부에 있는지 확인
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
    case "triangle":
      return isPointInTriangle(point, shape.startPoint, shape.endPoint);
    default:
      return false;
  }
};
