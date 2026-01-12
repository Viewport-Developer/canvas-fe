import type { Point, BoundingBox, ResizeHandleType } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { calculateDistance } from "./distance.utils";

// 리사이즈 핸들의 위치를 계산합니다.
export const getHandlePosition = (handle: ResizeHandleType, boundingBox: BoundingBox): Point => {
  const { topLeft, topRight, bottomLeft } = boundingBox;
  const width = topRight.x - topLeft.x;
  const height = bottomLeft.y - topLeft.y;
  const padding = Math.max(
    width * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
    height * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO
  );

  switch (handle) {
    case "topLeft":
      return { x: topLeft.x - padding, y: topLeft.y - padding };
    case "topRight":
      return { x: topRight.x + padding, y: topRight.y - padding };
    case "bottomLeft":
      return { x: topLeft.x - padding, y: bottomLeft.y + padding };
    case "bottomRight":
      return { x: topRight.x + padding, y: bottomLeft.y + padding };
    case "top":
      return { x: topLeft.x + width / 2, y: topLeft.y - padding };
    case "bottom":
      return { x: topLeft.x + width / 2, y: bottomLeft.y + padding };
    case "left":
      return { x: topLeft.x - padding, y: topLeft.y + height / 2 };
    case "right":
      return { x: topRight.x + padding, y: topLeft.y + height / 2 };
    default:
      return topLeft;
  }
};

// 주어진 점에서 리사이즈 핸들을 감지합니다.
export const getResizeHandleAtPoint = (point: Point, boundingBox: BoundingBox): ResizeHandleType | null => {
  const { topLeft, topRight, bottomLeft } = boundingBox;
  const width = topRight.x - topLeft.x;
  const height = bottomLeft.y - topLeft.y;

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

  // 변 핸들 체크
  if (
    Math.abs(point.y - (topLeft.y - padding)) <= handleRadius &&
    point.x >= topLeft.x - padding &&
    point.x <= topRight.x + padding
  ) {
    return "top";
  }

  if (
    Math.abs(point.y - (bottomLeft.y + padding)) <= handleRadius &&
    point.x >= topLeft.x - padding &&
    point.x <= topRight.x + padding
  ) {
    return "bottom";
  }

  if (
    Math.abs(point.x - (topLeft.x - padding)) <= handleRadius &&
    point.y >= topLeft.y - padding &&
    point.y <= bottomLeft.y + padding
  ) {
    return "left";
  }

  if (
    Math.abs(point.x - (topRight.x + padding)) <= handleRadius &&
    point.y >= topLeft.y - padding &&
    point.y <= bottomLeft.y + padding
  ) {
    return "right";
  }

  return null;
};
