// src/hooks/useZoom.ts
import { useEffect, type RefObject } from "react";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { useCanvasStore } from "../store/canvasStore";

export const useZoom = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
  const zoom = useCanvasStore((state) => state.zoom);
  const setZoom = useCanvasStore((state) => state.setZoom);
  const pan = useCanvasStore((state) => state.pan);
  const setPan = useCanvasStore((state) => state.setPan);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();

      const mouseX = (e.clientX - rect.left) / zoom + pan.x;
      const mouseY = (e.clientY - rect.top) / zoom + pan.y;

      const delta =
        e.deltaY > 0
          ? CANVAS_CONFIG.ZOOM_DELTA_OUT
          : CANVAS_CONFIG.ZOOM_DELTA_IN;
      const newZoom = Math.max(
        CANVAS_CONFIG.MIN_ZOOM,
        Math.min(CANVAS_CONFIG.MAX_ZOOM, zoom * delta)
      );

      const mouseXAfter = (e.clientX - rect.left) / newZoom + pan.x;
      const mouseYAfter = (e.clientY - rect.top) / newZoom + pan.y;

      const newPanX = pan.x - (mouseXAfter - mouseX);
      const newPanY = pan.y - (mouseYAfter - mouseY);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef, zoom, pan]);
};
