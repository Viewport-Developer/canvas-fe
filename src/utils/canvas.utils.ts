import type { Path } from "../types";

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
