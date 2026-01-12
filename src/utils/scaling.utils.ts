import type { Path, Shape, BoundingBox } from "../types";
import { calculateBoundingBox, calculateBoundingBoxSize } from "./boundingBox.utils";

// 스케일링 관련 유틸리티

// 경로를 새로운 바운딩 박스에 맞게 스케일링합니다.
export const scalePathToBoundingBox = (
  path: Path,
  oldBox: BoundingBox,
  newBox: BoundingBox
): Path => {
  const oldSize = calculateBoundingBoxSize(oldBox);
  const newSize = calculateBoundingBoxSize(newBox);

  // 스케일 비율 계산 (0으로 나누기 방지)
  const scaleX = oldSize.width !== 0 ? newSize.width / oldSize.width : 1;
  const scaleY = oldSize.height !== 0 ? newSize.height / oldSize.height : 1;

  // 원점 이동 계산
  const offsetX = newBox.topLeft.x - oldBox.topLeft.x;
  const offsetY = newBox.topLeft.y - oldBox.topLeft.y;

  // 모든 포인트를 스케일링하고 이동
  const scaledPoints = path.points.map((point) => ({
    x: (point.x - oldBox.topLeft.x) * scaleX + oldBox.topLeft.x + offsetX,
    y: (point.y - oldBox.topLeft.y) * scaleY + oldBox.topLeft.y + offsetY,
  }));

  return {
    ...path,
    points: scaledPoints,
    boundingBox: calculateBoundingBox(scaledPoints),
  };
};

// 도형을 새로운 바운딩 박스에 맞게 스케일링합니다.
export const scaleShapeToBoundingBox = (
  shape: Shape,
  oldBox: BoundingBox,
  newBox: BoundingBox
): Shape => {
  const oldSize = calculateBoundingBoxSize(oldBox);
  const newSize = calculateBoundingBoxSize(newBox);

  // 스케일 비율 계산 (0으로 나누기 방지)
  const scaleX = oldSize.width !== 0 ? newSize.width / oldSize.width : 1;
  const scaleY = oldSize.height !== 0 ? newSize.height / oldSize.height : 1;

  // 원점 이동 계산
  const offsetX = newBox.topLeft.x - oldBox.topLeft.x;
  const offsetY = newBox.topLeft.y - oldBox.topLeft.y;

  // startPoint와 endPoint를 스케일링하고 이동
  const newStartPoint = {
    x:
      (shape.startPoint.x - oldBox.topLeft.x) * scaleX +
      oldBox.topLeft.x +
      offsetX,
    y:
      (shape.startPoint.y - oldBox.topLeft.y) * scaleY +
      oldBox.topLeft.y +
      offsetY,
  };

  const newEndPoint = {
    x:
      (shape.endPoint.x - oldBox.topLeft.x) * scaleX +
      oldBox.topLeft.x +
      offsetX,
    y:
      (shape.endPoint.y - oldBox.topLeft.y) * scaleY +
      oldBox.topLeft.y +
      offsetY,
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
