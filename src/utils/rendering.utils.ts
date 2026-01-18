import type { BoundingBox, Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

// 캔버스를 지웁니다.
export const clearCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.clearRect(0, 0, width, height);
};

// 캔버스 변환을 적용합니다 (줌 및 팬).
export const applyCanvasZoom = (ctx: CanvasRenderingContext2D, zoom: number, panX: number, panY: number) => {
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(-panX, -panY);
};

// 캔버스 변환을 복원합니다.
export const restoreCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.restore();
};

// 선택된 요소의 바운딩 박스와 리사이즈 핸들을 그립니다.
export const drawSelectionBox = (ctx: CanvasRenderingContext2D, boundingBox: BoundingBox) => {
  ctx.save();
  ctx.strokeStyle = CANVAS_CONFIG.SELECTION_BOX_COLOR;
  ctx.lineWidth = CANVAS_CONFIG.SELECTION_BOX_LINE_WIDTH;
  ctx.globalAlpha = 1;

  const { topLeft, topRight, bottomLeft } = boundingBox;
  const width = topRight.x - topLeft.x;
  const height = bottomLeft.y - topLeft.y;

  // 패딩을 width와 height의 비율로 계산
  const padding = Math.max(
    width * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO,
    height * CANVAS_CONFIG.SELECTION_BOX_PADDING_RATIO
  );
  const handleRadius = CANVAS_CONFIG.RESIZE_HANDLE_RADIUS;

  // 선택 박스 테두리 그리기
  ctx.strokeRect(topLeft.x - padding, topLeft.y - padding, width + padding * 2, height + padding * 2);

  // 모서리 리사이즈 핸들 그리기
  ctx.fillStyle = CANVAS_CONFIG.SELECTION_BOX_HANDLE_COLOR;
  const corners = [
    { x: topLeft.x - padding, y: topLeft.y - padding },
    { x: topRight.x + padding, y: topRight.y - padding },
    { x: topLeft.x - padding, y: bottomLeft.y + padding },
    { x: topRight.x + padding, y: bottomLeft.y + padding },
  ];

  corners.forEach((corner) => {
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, handleRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};

// 드래그 박스를 그립니다.
export const drawDragSelectionBox = (ctx: CanvasRenderingContext2D, startPoint: Point, endPoint: Point) => {
  ctx.save();
  ctx.strokeStyle = CANVAS_CONFIG.SELECTION_BOX_COLOR;
  ctx.lineWidth = CANVAS_CONFIG.SELECTION_BOX_LINE_WIDTH;
  ctx.globalAlpha = 0.5;

  const minX = Math.min(startPoint.x, endPoint.x);
  const maxX = Math.max(startPoint.x, endPoint.x);
  const minY = Math.min(startPoint.y, endPoint.y);
  const maxY = Math.max(startPoint.y, endPoint.y);

  const width = maxX - minX;
  const height = maxY - minY;

  // 박스 테두리 그리기
  ctx.strokeRect(minX, minY, width, height);

  // 반투명 배경
  ctx.fillStyle = CANVAS_CONFIG.SELECTION_BOX_COLOR;
  ctx.globalAlpha = 0.1;
  ctx.fillRect(minX, minY, width, height);

  ctx.restore();
};
