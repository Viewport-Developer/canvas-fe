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

// 지우개 중심이 마름모 내부에 있는지 확인 (외적을 이용한 방법)
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
    case "diamond":
      return isPointInDiamond(point, shape.startPoint, shape.endPoint);
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
