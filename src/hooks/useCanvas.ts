import { useEffect, type RefObject } from "react";
import {
  clearCanvas,
  drawAllPaths,
  drawPath,
  applyCanvasZoom,
  restoreCanvas,
} from "../utils/canvas.utils";
import { useCanvasStore } from "../store/canvasStore";
import { useHistoryStore } from "../store/historyStore";

export const useCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>
) => {
  const { paths, currentPath, pathsToErase, zoom, pan } = useCanvasStore();
  const { saveHistory } = useHistoryStore();

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(ctx, canvas.width, canvas.height);

    applyCanvasZoom(ctx, zoom, pan.x, pan.y);

    drawAllPaths(ctx, paths, pathsToErase);

    if (currentPath) {
      drawPath(ctx, currentPath, false);
    }

    restoreCanvas(ctx);
  };

  useEffect(() => {
    saveHistory();
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        canvasRef.current.width = container.clientWidth;
        canvasRef.current.height = container.clientHeight;
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [canvasRef, containerRef]);

  useEffect(() => {
    redraw();
  }, [canvasRef, paths, currentPath, pathsToErase, zoom, pan]);
};
