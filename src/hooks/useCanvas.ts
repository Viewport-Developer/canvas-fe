import { useEffect, type RefObject } from "react";
import {
  clearCanvas,
  drawAllPaths,
  drawPath,
  drawAllShapes,
  drawShape,
  applyCanvasZoom,
  restoreCanvas,
} from "../utils/canvas.utils";
import { useCanvasStore } from "../store/canvasStore";

export const useCanvas = (
  backgroundCanvasRef: RefObject<HTMLCanvasElement | null>,
  foregroundCanvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>
) => {
  const {
    paths,
    currentPath,
    shapes,
    currentShape,
    pathsToErase,
    shapesToErase,
    zoom,
    pan,
  } = useCanvasStore();

  const redrawBackground = () => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height);

    applyCanvasZoom(ctx, zoom, pan.x, pan.y);

    drawAllPaths(ctx, paths, pathsToErase);
    drawAllShapes(ctx, shapes, shapesToErase);

    restoreCanvas(ctx);
  };

  const redrawForeground = () => {
    const canvas = foregroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height);

    if (currentPath || currentShape) {
      applyCanvasZoom(ctx, zoom, pan.x, pan.y);
      if (currentPath) {
        drawPath(ctx, currentPath, false);
      }
      if (currentShape) {
        drawShape(ctx, currentShape, false);
      }
      restoreCanvas(ctx);
    }
  };

  useEffect(() => {
    const updateSize = () => {
      if (backgroundCanvasRef.current && containerRef.current) {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        backgroundCanvasRef.current.width = width;
        backgroundCanvasRef.current.height = height;

        if (foregroundCanvasRef.current) {
          foregroundCanvasRef.current.width = width;
          foregroundCanvasRef.current.height = height;
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [backgroundCanvasRef, foregroundCanvasRef, containerRef]);

  useEffect(() => {
    redrawBackground();
  }, [paths, shapes, pathsToErase, shapesToErase, zoom, pan]);

  useEffect(() => {
    redrawForeground();
  }, [currentPath, currentShape]);
};
