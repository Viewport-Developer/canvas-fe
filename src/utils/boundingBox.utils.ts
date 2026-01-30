import type { Point, BoundingBox, Path, Shape, Text } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

// 포인트 배열로부터 바운딩 박스를 계산합니다.
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

// 선택된 경로, 도형, 텍스트의 결합된 바운딩 박스를 계산합니다.
export const getCombinedBoundingBox = (paths: Path[], shapes: Shape[], texts: Text[] = []): BoundingBox | null => {
  if (paths.length === 0 && shapes.length === 0 && texts.length === 0) {
    return null;
  }

  const allBoxes = [
    ...paths.map((p) => p.boundingBox),
    ...shapes.map((s) => s.boundingBox),
    ...texts.map((t) => t.boundingBox),
  ];

  let minX = allBoxes[0].topLeft.x;
  let maxX = allBoxes[0].topRight.x;
  let minY = allBoxes[0].topLeft.y;
  let maxY = allBoxes[0].bottomLeft.y;

  for (const box of allBoxes) {
    minX = Math.min(minX, box.topLeft.x);
    maxX = Math.max(maxX, box.topRight.x);
    minY = Math.min(minY, box.topLeft.y);
    maxY = Math.max(maxY, box.bottomLeft.y);
  }

  return {
    topLeft: { x: minX, y: minY },
    topRight: { x: maxX, y: minY },
    bottomLeft: { x: minX, y: maxY },
    bottomRight: { x: maxX, y: maxY },
  };
};

// 두 바운딩 박스가 교차하는지 확인합니다 (일부라도 겹치면 true).
export const doBoundingBoxesIntersect = (box1: BoundingBox, box2: BoundingBox): boolean => {
  const box1MinX = box1.topLeft.x;
  const box1MaxX = box1.topRight.x;
  const box1MinY = box1.topLeft.y;
  const box1MaxY = box1.bottomLeft.y;

  const box2MinX = box2.topLeft.x;
  const box2MaxX = box2.topRight.x;
  const box2MinY = box2.topLeft.y;
  const box2MaxY = box2.bottomLeft.y;

  return !(box1MaxX < box2MinX || box1MinX > box2MaxX || box1MaxY < box2MinY || box1MinY > box2MaxY);
};

// 텍스트의 바운딩 박스를 계산합니다.
export const calculateTextBoundingBox = (content: string, position: Point, fontSize: number): BoundingBox => {
  if (!content) {
    return {
      topLeft: { x: position.x, y: position.y },
      topRight: { x: position.x, y: position.y },
      bottomLeft: { x: position.x, y: position.y + fontSize },
      bottomRight: { x: position.x, y: position.y + fontSize },
    };
  }

  // 임시 캔버스 생성하여 텍스트 크기 측정
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) {
    return {
      topLeft: { x: position.x, y: position.y },
      topRight: { x: position.x, y: position.y },
      bottomLeft: { x: position.x, y: position.y + fontSize },
      bottomRight: { x: position.x, y: position.y + fontSize },
    };
  }

  tempCtx.font = `${fontSize}px sans-serif`;
  tempCtx.textBaseline = "top";

  let maxWidth = 0;
  const lines = content.split("\n");
  const lineHeight = fontSize + CANVAS_CONFIG.DEFAULT_TEXT_LINE_HEIGHT_OFFSET;

  for (const line of lines) {
    const metrics = tempCtx.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  }

  const totalHeight = lines.length * lineHeight;

  return {
    topLeft: { x: position.x, y: position.y },
    topRight: { x: position.x + maxWidth, y: position.y },
    bottomLeft: { x: position.x, y: position.y + totalHeight },
    bottomRight: { x: position.x + maxWidth, y: position.y + totalHeight },
  };
};
