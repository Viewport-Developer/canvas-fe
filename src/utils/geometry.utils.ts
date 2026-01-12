import type { Point, BoundingBox, Shape, ResizeHandleType } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

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

// 점이 선분에 가까운지 확인 (선의 두께 고려)
const isPointNearLineSegment = (
  point: Point,
  p1: Point,
  p2: Point,
  threshold: number
): boolean => {
  // 선분의 길이
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // 선분이 점인 경우
    return calculateDistance(point, p1) <= threshold;
  }

  // 점에서 선분까지의 최단 거리 계산
  const t = Math.max(
    0,
    Math.min(1, ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSquared)
  );
  const closestPoint = {
    x: p1.x + t * dx,
    y: p1.y + t * dy,
  };

  return calculateDistance(point, closestPoint) <= threshold;
};

// 점이 사각형의 선에 가까운지 확인
const isPointOnRectangle = (
  point: Point,
  startPoint: Point,
  endPoint: Point,
  threshold: number
): boolean => {
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
    isPointNearLineSegment(point, topLeft, topRight, threshold) || // 상단
    isPointNearLineSegment(point, bottomLeft, bottomRight, threshold) || // 하단
    isPointNearLineSegment(point, topLeft, bottomLeft, threshold) || // 좌측
    isPointNearLineSegment(point, topRight, bottomRight, threshold) // 우측
  );
};

// 점이 원/타원의 선에 가까운지 확인
const isPointOnCircle = (
  point: Point,
  startPoint: Point,
  endPoint: Point,
  threshold: number
): boolean => {
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
  return (
    Math.abs(distanceFromCenter - 1) * Math.min(radiusX, radiusY) <= threshold
  );
};

// 점이 마름모의 선에 가까운지 확인
const isPointOnDiamond = (
  point: Point,
  startPoint: Point,
  endPoint: Point,
  threshold: number
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

  // 4개의 변 체크
  return (
    isPointNearLineSegment(point, top, right, threshold) ||
    isPointNearLineSegment(point, right, bottom, threshold) ||
    isPointNearLineSegment(point, bottom, left, threshold) ||
    isPointNearLineSegment(point, left, top, threshold)
  );
};

// 점이 도형의 선에 가까운지 확인 (선 클릭 선택용)
export const isPointOnShape = (point: Point, shape: Shape): boolean => {
  // 먼저 바운딩 박스 체크로 빠르게 필터링
  if (!isPointInBoundingBox(point, shape.boundingBox)) {
    return false;
  }

  // 선의 두께를 고려한 임계값 (선의 두께 + 여유 공간)
  const threshold = shape.width / 2 + 5; // 선의 반 두께 + 5px 여유

  // 도형 타입별로 선에 가까운지 확인
  switch (shape.type) {
    case "rectangle":
      return isPointOnRectangle(
        point,
        shape.startPoint,
        shape.endPoint,
        threshold
      );
    case "circle":
      return isPointOnCircle(
        point,
        shape.startPoint,
        shape.endPoint,
        threshold
      );
    case "diamond":
      return isPointOnDiamond(
        point,
        shape.startPoint,
        shape.endPoint,
        threshold
      );
    default:
      return false;
  }
};

export const getResizeHandleAtPoint = (
  point: Point,
  boundingBox: BoundingBox
): ResizeHandleType | null => {
  const { topLeft, topRight, bottomLeft } = boundingBox;
  const width = topRight.x - topLeft.x;
  const height = bottomLeft.y - topLeft.y;

  // padding을 width와 height의 비율로 계산
  const padding = Math.max(
    width * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
    height * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO
  );
  const handleRadius = CANVAS_CONFIG.RESIZE_HANDLE_RADIUS;

  // 모서리 핸들 위치
  const corners = {
    topLeft: { x: topLeft.x - padding, y: topLeft.y - padding },
    topRight: { x: topRight.x + padding, y: topRight.y - padding },
    bottomLeft: { x: topLeft.x - padding, y: bottomLeft.y + padding },
    bottomRight: { x: topRight.x + padding, y: bottomLeft.y + padding },
  };

  // 모서리 핸들 체크
  for (const [cornerType, cornerPos] of Object.entries(corners)) {
    const distance = calculateDistance(point, cornerPos);
    if (distance <= handleRadius) {
      return cornerType as ResizeHandleType;
    }
  }

  // 변 핸들 체크 (모서리가 아닌 경우)
  // 상단 변
  if (
    Math.abs(point.y - (topLeft.y - padding)) <= handleRadius &&
    point.x >= topLeft.x - padding &&
    point.x <= topRight.x + padding
  ) {
    return "top";
  }

  // 하단 변
  if (
    Math.abs(point.y - (bottomLeft.y + padding)) <= handleRadius &&
    point.x >= topLeft.x - padding &&
    point.x <= topRight.x + padding
  ) {
    return "bottom";
  }

  // 좌측 변
  if (
    Math.abs(point.x - (topLeft.x - padding)) <= handleRadius &&
    point.y >= topLeft.y - padding &&
    point.y <= bottomLeft.y + padding
  ) {
    return "left";
  }

  // 우측 변
  if (
    Math.abs(point.x - (topRight.x + padding)) <= handleRadius &&
    point.y >= topLeft.y - padding &&
    point.y <= bottomLeft.y + padding
  ) {
    return "right";
  }

  return null;
};
