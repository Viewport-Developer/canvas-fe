import type { Point, BoundingBox, Path, Shape } from "../types";

// 포인트 배열로부터 바운딩 박스를 계산합니다.
export const calculateBoundingBox = (points: Point[]): BoundingBox => {
  if (points.length === 0) {
    throw new Error("포인트 배열이 비어있습니다.");
  }

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

// 점이 바운딩 박스 내부에 있는지 확인합니다.
export const isPointInBoundingBox = (point: Point, boundingBox: BoundingBox): boolean => {
  const minX = boundingBox.topLeft.x;
  const maxX = boundingBox.topRight.x;
  const minY = boundingBox.topLeft.y;
  const maxY = boundingBox.bottomLeft.y;

  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
};

// 바운딩 박스의 크기를 계산합니다.
export const calculateBoundingBoxSize = (box: BoundingBox) => ({
  width: box.topRight.x - box.topLeft.x,
  height: box.bottomLeft.y - box.topLeft.y,
});

// 선택된 경로와 도형의 결합된 바운딩 박스를 계산합니다.
export const getCombinedBoundingBox = (paths: Path[], shapes: Shape[]): BoundingBox | null => {
  if (paths.length === 0 && shapes.length === 0) {
    return null;
  }

  const allBoxes = [...paths.map((p) => p.boundingBox), ...shapes.map((s) => s.boundingBox)];

  let minX = allBoxes[0].topLeft.x;
  let maxX = allBoxes[0].topRight.x;
  let minY = allBoxes[0].topLeft.y;
  let maxY = allBoxes[0].bottomLeft.y;

  allBoxes.forEach((box) => {
    minX = Math.min(minX, box.topLeft.x);
    maxX = Math.max(maxX, box.topRight.x);
    minY = Math.min(minY, box.topLeft.y);
    maxY = Math.max(maxY, box.bottomLeft.y);
  });

  return {
    topLeft: { x: minX, y: minY },
    topRight: { x: maxX, y: minY },
    bottomLeft: { x: minX, y: maxY },
    bottomRight: { x: maxX, y: maxY },
  };
};
