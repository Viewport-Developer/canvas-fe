import { useState } from "react";
import type { Point } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useToolStore } from "../store/toolStore";
import { useHistoryStore } from "../store/historyStore";

export const usePan = () => {
  const { setIsPanning } = useToolStore();
  const { zoom, pan, setPan } = useCanvasStore();
  const { saveHistory } = useHistoryStore();

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
    saveHistory();
  };

  return {
    startPanning,
    doPanning,
    stopPanning,
  };
};
