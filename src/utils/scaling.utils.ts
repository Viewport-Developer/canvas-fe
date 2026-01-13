import type { Path, Shape, BoundingBox } from "../types";
import { calculateBoundingBox, calculateBoundingBoxSize } from "./boundingBox.utils";

// 경로를 새로운 바운딩 박스에 맞게 스케일링합니다.
export const scalePathToBoundingBox = (path: Path, oldBox: BoundingBox, newBox: BoundingBox): Path => {
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
export const scaleShapeToBoundingBox = (shape: Shape, oldBox: BoundingBox, newBox: BoundingBox): Shape => {
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
    x: (shape.startPoint.x - oldBox.topLeft.x) * scaleX + oldBox.topLeft.x + offsetX,
    y: (shape.startPoint.y - oldBox.topLeft.y) * scaleY + oldBox.topLeft.y + offsetY,
  };

  const newEndPoint = {
    x: (shape.endPoint.x - oldBox.topLeft.x) * scaleX + oldBox.topLeft.x + offsetX,
    y: (shape.endPoint.y - oldBox.topLeft.y) * scaleY + oldBox.topLeft.y + offsetY,
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

// 결합된 바운딩 박스의 비율에 맞게 경로를 스케일링합니다.
export const scalePathByCombinedBoundingBox = (
  path: Path,
  initialPathBox: BoundingBox,
  initialCombinedBox: BoundingBox,
  newCombinedBox: BoundingBox
): Path => {
  const initialCombinedSize = calculateBoundingBoxSize(initialCombinedBox);
  const newCombinedSize = calculateBoundingBoxSize(newCombinedBox);

  // 결합된 바운딩 박스의 스케일 비율 계산
  const scaleX = initialCombinedSize.width !== 0 ? newCombinedSize.width / initialCombinedSize.width : 1;
  const scaleY = initialCombinedSize.height !== 0 ? newCombinedSize.height / initialCombinedSize.height : 1;

  // 초기 결합된 바운딩 박스의 중심점
  const initialCombinedCenter = {
    x: (initialCombinedBox.topLeft.x + initialCombinedBox.topRight.x) / 2,
    y: (initialCombinedBox.topLeft.y + initialCombinedBox.bottomLeft.y) / 2,
  };

  // 새로운 결합된 바운딩 박스의 중심점
  const newCombinedCenter = {
    x: (newCombinedBox.topLeft.x + newCombinedBox.topRight.x) / 2,
    y: (newCombinedBox.topLeft.y + newCombinedBox.bottomLeft.y) / 2,
  };

  // 초기 경로 바운딩 박스의 중심점
  const initialPathCenter = {
    x: (initialPathBox.topLeft.x + initialPathBox.topRight.x) / 2,
    y: (initialPathBox.topLeft.y + initialPathBox.bottomLeft.y) / 2,
  };

  // 결합된 바운딩 박스 중심점 기준 상대 위치
  const relativeX = initialPathCenter.x - initialCombinedCenter.x;
  const relativeY = initialPathCenter.y - initialCombinedCenter.y;

  // 새로운 결합된 바운딩 박스 중심점 기준 새 위치
  const newPathCenter = {
    x: newCombinedCenter.x + relativeX * scaleX,
    y: newCombinedCenter.y + relativeY * scaleY,
  };

  // 각 포인트를 스케일링하고 이동
  const scaledPoints = path.points.map((point) => {
    // 초기 경로 중심점 기준 상대 위치
    const relativePointX = point.x - initialPathCenter.x;
    const relativePointY = point.y - initialPathCenter.y;

    // 새로운 경로 중심점 기준 새 위치
    return {
      x: newPathCenter.x + relativePointX * scaleX,
      y: newPathCenter.y + relativePointY * scaleY,
    };
  });

  return {
    ...path,
    points: scaledPoints,
    boundingBox: calculateBoundingBox(scaledPoints),
  };
};

// 결합된 바운딩 박스의 비율에 맞게 도형을 스케일링합니다.
export const scaleShapeByCombinedBoundingBox = (
  shape: Shape,
  initialShapeBox: BoundingBox,
  initialCombinedBox: BoundingBox,
  newCombinedBox: BoundingBox
): Shape => {
  const initialCombinedSize = calculateBoundingBoxSize(initialCombinedBox);
  const newCombinedSize = calculateBoundingBoxSize(newCombinedBox);

  // 결합된 바운딩 박스의 스케일 비율 계산
  const scaleX = initialCombinedSize.width !== 0 ? newCombinedSize.width / initialCombinedSize.width : 1;
  const scaleY = initialCombinedSize.height !== 0 ? newCombinedSize.height / initialCombinedSize.height : 1;

  // 초기 결합된 바운딩 박스의 중심점
  const initialCombinedCenter = {
    x: (initialCombinedBox.topLeft.x + initialCombinedBox.topRight.x) / 2,
    y: (initialCombinedBox.topLeft.y + initialCombinedBox.bottomLeft.y) / 2,
  };

  // 새로운 결합된 바운딩 박스의 중심점
  const newCombinedCenter = {
    x: (newCombinedBox.topLeft.x + newCombinedBox.topRight.x) / 2,
    y: (newCombinedBox.topLeft.y + newCombinedBox.bottomLeft.y) / 2,
  };

  // 초기 도형 바운딩 박스의 중심점
  const initialShapeCenter = {
    x: (initialShapeBox.topLeft.x + initialShapeBox.topRight.x) / 2,
    y: (initialShapeBox.topLeft.y + initialShapeBox.bottomLeft.y) / 2,
  };

  // 결합된 바운딩 박스 중심점 기준 상대 위치
  const relativeX = initialShapeCenter.x - initialCombinedCenter.x;
  const relativeY = initialShapeCenter.y - initialCombinedCenter.y;

  // 새로운 결합된 바운딩 박스 중심점 기준 새 위치
  const newShapeCenter = {
    x: newCombinedCenter.x + relativeX * scaleX,
    y: newCombinedCenter.y + relativeY * scaleY,
  };

  // startPoint와 endPoint를 스케일링하고 이동
  const relativeStartX = shape.startPoint.x - initialShapeCenter.x;
  const relativeStartY = shape.startPoint.y - initialShapeCenter.y;
  const relativeEndX = shape.endPoint.x - initialShapeCenter.x;
  const relativeEndY = shape.endPoint.y - initialShapeCenter.y;

  const newStartPoint = {
    x: newShapeCenter.x + relativeStartX * scaleX,
    y: newShapeCenter.y + relativeStartY * scaleY,
  };

  const newEndPoint = {
    x: newShapeCenter.x + relativeEndX * scaleX,
    y: newShapeCenter.y + relativeEndY * scaleY,
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
