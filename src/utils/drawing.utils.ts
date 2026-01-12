import type { Path, Shape } from "../types";

// 그리기 관련 유틸리티

// 단일 경로를 그립니다.
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

// 모든 경로를 그립니다.
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

// 단일 도형을 그립니다.
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
    case "diamond": {
      // 마름모: 중심에서 상하좌우 4개 점
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
  }

  ctx.stroke();
};

// 모든 도형을 그립니다.
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
