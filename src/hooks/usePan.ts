import { useState } from "react";
import type { Point } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useToolStore } from "../store/toolStore";

export const usePan = () => {
  const setIsPanning = useToolStore((state) => state.setIsPanning);

  const zoom = useCanvasStore((state) => state.zoom);
  const pan = useCanvasStore((state) => state.pan);
  const setPan = useCanvasStore((state) => state.setPan);

  const [panStart, setPanStart] = useState<Point | null>(null);

  const startPanning = (e: React.MouseEvent) => {
    setPanStart({ x: e.clientX, y: e.clientY });
    setIsPanning(true);
  };

  const doPanning = (e: React.MouseEvent) => {
    if (!panStart) return;

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    const canvasDx = dx / zoom;
    const canvasDy = dy / zoom;

    setPan({
      x: pan.x - canvasDx,
      y: pan.y - canvasDy,
    });

    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const stopPanning = () => {
    setPanStart(null);
    setIsPanning(false);
  };

  return {
    startPanning,
    doPanning,
    stopPanning,
  };
};
