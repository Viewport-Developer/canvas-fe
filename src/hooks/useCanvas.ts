import { useEffect, type RefObject } from "react";
import {
  clearCanvas,
  drawAllPaths,
  drawPath,
  applyCanvasZoom,
  restoreCanvas,
} from "../utils/canvas.utils";
import { useCanvasStore } from "../store/canvasStore";

export const useCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>
) => {
  const paths = useCanvasStore((state) => state.paths);
  const currentPath = useCanvasStore((state) => state.currentPath);
  const pathsToErase = useCanvasStore((state) => state.pathsToErase);
  const zoom = useCanvasStore((state) => state.zoom);
  const pan = useCanvasStore((state) => state.pan);

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
