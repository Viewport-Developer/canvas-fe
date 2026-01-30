import type { Point, BoundingBox, ResizeHandleType } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { calculateDistance } from "./distance.utils";
import { calculateBoundingBox } from "./boundingBox.utils";

// 리사이즈 핸들의 위치를 계산합니다.
export const getHandlePosition = (handle: ResizeHandleType, boundingBox: BoundingBox): Point => {
  const { topLeft, topRight, bottomLeft } = boundingBox;

  const width = topRight.x - topLeft.x;
  const height = bottomLeft.y - topLeft.y;
  const padding = Math.max(
    width * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
    height * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
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
    height * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
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

/** 리사이즈 핸들·클릭 위치를 기준으로 새로운 바운딩 박스를 계산합니다. */
export const calculateNewBoundingBox = (
  currentPoint: Point,
  handle: ResizeHandleType,
  initialBox: BoundingBox,
  initialClickPosition: Point,
  isTextResize: boolean = false,
): BoundingBox => {
  const initialHandlePosition = getHandlePosition(handle, initialBox);

  const offsetX = initialClickPosition.x - initialHandlePosition.x;
  const offsetY = initialClickPosition.y - initialHandlePosition.y;
  const newHandlePosition: Point = {
    x: currentPoint.x - offsetX,
    y: currentPoint.y - offsetY,
  };

  const initialWidth = initialBox.topRight.x - initialBox.topLeft.x;
  const initialHeight = initialBox.bottomLeft.y - initialBox.topLeft.y;
  const padding = Math.max(
    initialWidth * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
    initialHeight * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
  );

  let point1: Point;
  let point2: Point;

  if (isTextResize) {
    switch (handle) {
      case "left":
      case "topLeft":
      case "bottomLeft":
        point1 = { x: newHandlePosition.x + padding, y: initialBox.topLeft.y };
        point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
        break;
      case "right":
      case "topRight":
      case "bottomRight":
        point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
        point2 = { x: newHandlePosition.x - padding, y: initialBox.bottomRight.y };
        break;
      case "top":
      case "bottom": {
        const boxHeight = initialBox.bottomLeft.y - initialBox.topLeft.y;
        const newHeight =
          handle === "top"
            ? initialBox.bottomLeft.y - (newHandlePosition.y + padding)
            : newHandlePosition.y - padding - initialBox.topLeft.y;

        const heightRatio = boxHeight !== 0 ? newHeight / boxHeight : 1;
        const boxWidth = initialBox.topRight.x - initialBox.topLeft.x;
        const newWidth = boxWidth * heightRatio;

        const centerX = (initialBox.topLeft.x + initialBox.topRight.x) / 2;
        point1 = {
          x: centerX - newWidth / 2,
          y: handle === "top" ? newHandlePosition.y + padding : initialBox.topLeft.y,
        };
        point2 = {
          x: centerX + newWidth / 2,
          y: handle === "top" ? initialBox.bottomRight.y : newHandlePosition.y - padding,
        };
        break;
      }
      default:
        return initialBox;
    }
    return calculateBoundingBox([point1, point2]);
  }

  switch (handle) {
    case "topLeft":
      point1 = { x: newHandlePosition.x + padding, y: newHandlePosition.y + padding };
      point2 = initialBox.bottomRight;
      break;
    case "topRight":
      point1 = { x: newHandlePosition.x - padding, y: newHandlePosition.y + padding };
      point2 = initialBox.bottomLeft;
      break;
    case "bottomLeft":
      point1 = { x: newHandlePosition.x + padding, y: newHandlePosition.y - padding };
      point2 = initialBox.topRight;
      break;
    case "bottomRight":
      point1 = { x: newHandlePosition.x - padding, y: newHandlePosition.y - padding };
      point2 = initialBox.topLeft;
      break;
    case "top":
      point1 = { x: initialBox.topLeft.x, y: newHandlePosition.y + padding };
      point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
      break;
    case "bottom":
      point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
      point2 = { x: initialBox.bottomRight.x, y: newHandlePosition.y - padding };
      break;
    case "left":
      point1 = { x: newHandlePosition.x + padding, y: initialBox.topLeft.y };
      point2 = { x: initialBox.bottomRight.x, y: initialBox.bottomRight.y };
      break;
    case "right":
      point1 = { x: initialBox.topLeft.x, y: initialBox.topLeft.y };
      point2 = { x: newHandlePosition.x - padding, y: initialBox.bottomRight.y };
      break;
    default:
      return initialBox;
  }

  let minX = Math.min(point1.x, point2.x);
  let maxX = Math.max(point1.x, point2.x);
  let minY = Math.min(point1.y, point2.y);
  let maxY = Math.max(point1.y, point2.y);

  const minSize = CANVAS_CONFIG.MIN_RESIZE_SIZE;
  const width = maxX - minX;
  const height = maxY - minY;

  if (width < minSize) {
    const centerX = (minX + maxX) / 2;
    minX = centerX - minSize / 2;
    maxX = centerX + minSize / 2;
  }

  if (height < minSize) {
    const centerY = (minY + maxY) / 2;
    minY = centerY - minSize / 2;
    maxY = centerY + minSize / 2;
  }

  return {
    topLeft: { x: minX, y: minY },
    topRight: { x: maxX, y: minY },
    bottomLeft: { x: minX, y: maxY },
    bottomRight: { x: maxX, y: maxY },
  };
};
