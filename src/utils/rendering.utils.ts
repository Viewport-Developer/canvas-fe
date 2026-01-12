import type { BoundingBox } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

// 렌더링 관련 유틸리티

// 캔버스를 지웁니다.
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.clearRect(0, 0, width, height);
};

// 캔버스 변환을 적용합니다 (줌 및 팬).
export const applyCanvasZoom = (
  ctx: CanvasRenderingContext2D,
  zoom: number,
  panX: number,
  panY: number
) => {
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(-panX, -panY);
};

// 캔버스 변환을 복원합니다.
export const restoreCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.restore();
};

// 선택된 요소의 바운딩 박스와 리사이즈 핸들을 그립니다.
export const drawSelectionBox = (
  ctx: CanvasRenderingContext2D,
  boundingBox: BoundingBox
) => {
  ctx.save();
  ctx.strokeStyle = "#5B57D1";
  ctx.lineWidth = 1;
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
  ctx.strokeRect(
    topLeft.x - padding,
    topLeft.y - padding,
    width + padding * 2,
    height + padding * 2
  );

  // 모서리 리사이즈 핸들 그리기
  ctx.fillStyle = "#5B57D1";
  const corners = [
    { x: topLeft.x - padding, y: topLeft.y - padding }, // topLeft
    { x: topRight.x + padding, y: topRight.y - padding }, // topRight
    { x: topLeft.x - padding, y: bottomLeft.y + padding }, // bottomLeft
    { x: topRight.x + padding, y: bottomLeft.y + padding }, // bottomRight
  ];

  corners.forEach((corner) => {
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, handleRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};
