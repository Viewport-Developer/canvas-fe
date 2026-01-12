import type { Path, Shape, BoundingBox } from "../types";

export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.clearRect(0, 0, width, height);
};

export const drawPath = (
  ctx: CanvasRenderingContext2D,
  path: Path,
  isInPathsToErase: boolean = false
) => {
  if (path.points.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = path.color;
  ctx.lineWidth = path.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = isInPathsToErase ? 0.3 : 1;

  ctx.moveTo(path.points[0].x, path.points[0].y);

  for (let i = 1; i < path.points.length; i++) {
    ctx.lineTo(path.points[i].x, path.points[i].y);
  }

  ctx.stroke();
};

export const drawAllPaths = (
  ctx: CanvasRenderingContext2D,
  paths: Path[],
  pathsToErase: string[] = []
) => {
  paths.forEach((path) => {
    const willBeErased = pathsToErase.includes(path.id);
    drawPath(ctx, path, willBeErased);
  });
};

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

export const restoreCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.restore();
};

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  isInPathsToErase: boolean = false
) => {
  ctx.beginPath();
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.width;
  ctx.globalAlpha = isInPathsToErase ? 0.3 : 1;

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
    case "triangle": {
      const topX = centerX;
      const topY = startPoint.y;
      const bottomLeftX = startPoint.x;
      const bottomLeftY = endPoint.y;
      const bottomRightX = endPoint.x;
      const bottomRightY = endPoint.y;

      ctx.moveTo(topX, topY);
      ctx.lineTo(bottomLeftX, bottomLeftY);
      ctx.lineTo(bottomRightX, bottomRightY);
      ctx.closePath();
      break;
    }
  }

  ctx.stroke();
};

export const drawAllShapes = (
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  shapesToErase: string[] = []
) => {
  shapes.forEach((shape) => {
    const willBeErased = shapesToErase.includes(shape.id);
    drawShape(ctx, shape, willBeErased);
  });
};

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

  const padding = 10;
  const cornerRadius = 5;

  // 테두리 그리기
  ctx.strokeRect(
    topLeft.x - padding,
    topLeft.y - padding,
    width + padding * 2,
    height + padding * 2
  );

  // 모서리 동그라미 그리기
  ctx.fillStyle = "#5B57D1";
  const corners = [
    { x: topLeft.x - padding, y: topLeft.y - padding }, // topLeft
    { x: topRight.x + padding, y: topRight.y - padding }, // topRight
    { x: topLeft.x - padding, y: bottomLeft.y + padding }, // bottomLeft
    { x: topRight.x + padding, y: bottomLeft.y + padding }, // bottomRight
  ];

  corners.forEach((corner) => {
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, cornerRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};
