import type { Path, Shape, Text, Point } from "../types";
import { calculateBoundingBox, calculateTextBoundingBox } from "./boundingBox.utils";

// 곡선을 지정된 오프셋만큼 이동합니다.
export const movePath = (path: Path, offset: Point): Path => {
  const movedPoints = path.points.map((point) => ({
    x: point.x + offset.x,
    y: point.y + offset.y,
  }));

  return {
    ...path,
    points: movedPoints,
    boundingBox: calculateBoundingBox(movedPoints),
  };
};

// 도형을 지정된 오프셋만큼 이동합니다.
export const moveShape = (shape: Shape, offset: Point): Shape => {
  const newStartPoint = {
    x: shape.startPoint.x + offset.x,
    y: shape.startPoint.y + offset.y,
  };

  const newEndPoint = {
    x: shape.endPoint.x + offset.x,
    y: shape.endPoint.y + offset.y,
  };

  const minX = Math.min(newStartPoint.x, newEndPoint.x);
  const maxX = Math.max(newStartPoint.x, newEndPoint.x);
  const minY = Math.min(newStartPoint.y, newEndPoint.y);
  const maxY = Math.max(newStartPoint.y, newEndPoint.y);

  return {
    ...shape,
    startPoint: newStartPoint,
    endPoint: newEndPoint,
    boundingBox: {
      topLeft: { x: minX, y: minY },
      topRight: { x: maxX, y: minY },
      bottomLeft: { x: minX, y: maxY },
      bottomRight: { x: maxX, y: maxY },
    },
  };
};

// 텍스트를 지정된 오프셋만큼 이동합니다.
export const moveText = (text: Text, offset: Point): Text => {
  const newPosition = {
    x: text.position.x + offset.x,
    y: text.position.y + offset.y,
  };

  return {
    ...text,
    position: newPosition,
    boundingBox: calculateTextBoundingBox(text.content, newPosition, text.fontSize),
  };
};
