import type { Path, Shape, Text } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

// 단일 경로를 그립니다.
export const drawPath = (ctx: CanvasRenderingContext2D, path: Path, isInPathsToErase: boolean = false) => {
  if (path.points.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = path.color;
  ctx.lineWidth = path.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = isInPathsToErase ? CANVAS_CONFIG.ERASE_PREVIEW_ALPHA : 1;

  ctx.moveTo(path.points[0].x, path.points[0].y);

  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y);
  }

  ctx.stroke();
};

// 모든 경로를 그립니다.
export const drawAllPaths = (ctx: CanvasRenderingContext2D, paths: Path[], pathsToErase: Set<string> = new Set()) => {
  for (const path of paths) {
    const willBeErased = pathsToErase.has(path.id);
    drawPath(ctx, path, willBeErased);
  }
};

// 단일 도형을 그립니다.
export const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape, isInPathsToErase: boolean = false) => {
  ctx.beginPath();
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.width;
  ctx.globalAlpha = isInPathsToErase ? CANVAS_CONFIG.ERASE_PREVIEW_ALPHA : 1;

  const { startPoint, endPoint } = shape;
  const width = endPoint.x - startPoint.x;
  const height = endPoint.y - startPoint.y;
  const centerX = startPoint.x + width / 2;
  const centerY = startPoint.y + height / 2;
  const radiusX = Math.abs(width) / 2;
  const radiusY = Math.abs(height) / 2;

  switch (shape.type) {
    case "rectangle":
      ctx.rect(startPoint.x, startPoint.y, width, height);
      break;
    case "circle":
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      break;
    case "diamond": {
      const topX = centerX;
      const topY = startPoint.y;
      const rightX = endPoint.x;
      const rightY = centerY;
      const bottomX = centerX;
      const bottomY = endPoint.y;
      const leftX = startPoint.x;
      const leftY = centerY;

      ctx.moveTo(topX, topY);
      ctx.lineTo(rightX, rightY);
      ctx.lineTo(bottomX, bottomY);
      ctx.lineTo(leftX, leftY);
      ctx.closePath();
      break;
    }
    default:
      break;
  }

  ctx.stroke();
};

// 모든 도형을 그립니다.
export const drawAllShapes = (
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  shapesToErase: Set<string> = new Set(),
) => {
  for (const shape of shapes) {
    const willBeErased = shapesToErase.has(shape.id);
    drawShape(ctx, shape, willBeErased);
  }
};

// 단일 텍스트를 그립니다.
export const drawText = (ctx: CanvasRenderingContext2D, text: Text, isInTextsToErase: boolean = false) => {
  if (!text.content) return;

  ctx.save();
  ctx.fillStyle = text.color;
  ctx.font = `${text.fontSize}px sans-serif`;
  ctx.textBaseline = "top";
  ctx.globalAlpha = isInTextsToErase ? CANVAS_CONFIG.ERASE_PREVIEW_ALPHA : 1;

  const lines = text.content.split("\n");
  const lineHeight = text.fontSize + CANVAS_CONFIG.DEFAULT_TEXT_LINE_HEIGHT_OFFSET;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    ctx.fillText(line, text.position.x, text.position.y + index * lineHeight);
  }

  ctx.restore();
};

// 모든 텍스트를 그립니다.
export const drawAllTexts = (
  ctx: CanvasRenderingContext2D,
  texts: Text[],
  textsToErase: Set<string> = new Set(),
  editingTextId: string | null,
) => {
  for (const text of texts) {
    // 편집 중인 텍스트는 렌더링하지 않음
    if (text.id === editingTextId) continue;

    const willBeErased = textsToErase.has(text.id);
    drawText(ctx, text, willBeErased);
  }
};
