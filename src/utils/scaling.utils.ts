import type { Path, Shape, Text, BoundingBox, ResizeHandleType } from "../types";
import { calculateBoundingBox, calculateBoundingBoxSize, calculateTextBoundingBox } from "./boundingBox.utils";

// 결합된 바운딩 박스의 비율에 맞게 경로를 스케일링합니다.
export const scalePathByCombinedBoundingBox = (
  path: Path,
  initialPathBox: BoundingBox,
  initialCombinedBox: BoundingBox,
  newCombinedBox: BoundingBox,
  resizeHandle?: ResizeHandleType | null
): Path => {
  const initialCombinedSize = calculateBoundingBoxSize(initialCombinedBox);
  const newCombinedSize = calculateBoundingBoxSize(newCombinedBox);

  // 결합된 바운딩 박스의 스케일 비율 계산
  let scaleX = initialCombinedSize.width !== 0 ? newCombinedSize.width / initialCombinedSize.width : 1;
  let scaleY = initialCombinedSize.height !== 0 ? newCombinedSize.height / initialCombinedSize.height : 1;

  // 텍스트가 포함된 리사이즈: 텍스트처럼 동작
  if (resizeHandle) {
    if (resizeHandle === "top" || resizeHandle === "bottom") {
      scaleX = scaleY;
    } else {
      scaleY = scaleX;
    }
  }

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
    const relativePointX = point.x - initialPathCenter.x;
    const relativePointY = point.y - initialPathCenter.y;

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
  newCombinedBox: BoundingBox,
  resizeHandle?: ResizeHandleType | null
): Shape => {
  const initialCombinedSize = calculateBoundingBoxSize(initialCombinedBox);
  const newCombinedSize = calculateBoundingBoxSize(newCombinedBox);

  // 결합된 바운딩 박스의 스케일 비율 계산
  let scaleX = initialCombinedSize.width !== 0 ? newCombinedSize.width / initialCombinedSize.width : 1;
  let scaleY = initialCombinedSize.height !== 0 ? newCombinedSize.height / initialCombinedSize.height : 1;

  // 텍스트가 포함된 리사이즈: 텍스트처럼 동작
  if (resizeHandle) {
    if (resizeHandle === "top" || resizeHandle === "bottom") {
      scaleX = scaleY;
    } else {
      scaleY = scaleX;
    }
  }

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

// 결합된 바운딩 박스의 비율에 맞게 텍스트를 스케일링합니다.
export const scaleTextByCombinedBoundingBox = (
  text: Text,
  initialTextBox: BoundingBox,
  initialCombinedBox: BoundingBox,
  newCombinedBox: BoundingBox,
  resizeHandle?: ResizeHandleType
): Text => {
  const initialCombinedWidth = initialCombinedBox.topRight.x - initialCombinedBox.topLeft.x;
  const newCombinedWidth = newCombinedBox.topRight.x - newCombinedBox.topLeft.x;
  const initialCombinedHeight = initialCombinedBox.bottomLeft.y - initialCombinedBox.topLeft.y;
  const newCombinedHeight = newCombinedBox.bottomLeft.y - newCombinedBox.topLeft.y;

  // 결합된 바운딩 박스의 너비 스케일 비율 계산
  const widthRatio = initialCombinedWidth !== 0 ? newCombinedWidth / initialCombinedWidth : 1;

  // 결합된 바운딩 박스의 높이 스케일 비율 계산
  const heightRatio = initialCombinedHeight !== 0 ? newCombinedHeight / initialCombinedHeight : 1;

  let scaleRatio: number;
  if (resizeHandle === "top" || resizeHandle === "bottom") {
    // 위아래 핸들: 높이 비율 사용
    scaleRatio = heightRatio;
  } else {
    // 좌우/모서리 핸들: 너비 비율 사용
    scaleRatio = widthRatio;
  }

  // 폰트 사이즈를 스케일 비율에 맞게 조정
  const newFontSize = text.fontSize * scaleRatio;

  // 최소 폰트 사이즈 보장 (1px 이상)
  const finalFontSize = Math.max(1, newFontSize);

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

  // 초기 텍스트 바운딩 박스의 중심점
  const initialTextCenter = {
    x: (initialTextBox.topLeft.x + initialTextBox.topRight.x) / 2,
    y: (initialTextBox.topLeft.y + initialTextBox.bottomLeft.y) / 2,
  };

  // 결합된 바운딩 박스 중심점 기준 상대 위치
  const relativeX = initialTextCenter.x - initialCombinedCenter.x;
  const relativeY = initialTextCenter.y - initialCombinedCenter.y;

  // 새로운 결합된 바운딩 박스 중심점 기준 새 위치
  const newTextCenter = {
    x: newCombinedCenter.x + relativeX * scaleRatio,
    y: newCombinedCenter.y + relativeY * scaleRatio,
  };

  // 초기 텍스트의 너비 계산
  const initialTextWidth = initialTextBox.topRight.x - initialTextBox.topLeft.x;
  const newTextWidth = initialTextWidth * scaleRatio;

  // 새로운 위치 계산 (중심점 기준)
  const newPosition = {
    x: newTextCenter.x - newTextWidth / 2,
    y: newTextCenter.y - ((initialTextBox.bottomLeft.y - initialTextBox.topLeft.y) * scaleRatio) / 2,
  };

  // 새로운 바운딩 박스 계산
  const newBoundingBox = calculateTextBoundingBox(text.content, newPosition, finalFontSize);

  return {
    ...text,
    position: newPosition,
    fontSize: finalFontSize,
    boundingBox: newBoundingBox,
  };
};
