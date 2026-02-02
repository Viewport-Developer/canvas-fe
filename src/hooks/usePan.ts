import { useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import type { Point } from "../types";
import { useViewportStore } from "../store/viewportStore";
import { useToolStore } from "../store/toolStore";
import { useHistoryStore } from "../store/historyStore";

export const usePan = () => {
  const [setIsPanning] = useToolStore(useShallow((s) => [s.setIsPanning]));
  const [zoom, pan, setPan] = useViewportStore(useShallow((s) => [s.zoom, s.pan, s.setPan]));
  const [savePanAction] = useHistoryStore(useShallow((s) => [s.savePanAction]));

  const [panStart, setPanStart] = useState<Point | null>(null);
  const [initialPan, setInitialPan] = useState<Point | null>(null);

  // 팬을 시작합니다.
  const startPanning = useCallback(
    (e: React.MouseEvent) => {
      setPanStart({ x: e.clientX, y: e.clientY });
      setInitialPan({ ...pan });
      setIsPanning(true);
    },
    [pan, setIsPanning]
  );

  // 팬을 계속합니다.
  const doPanning = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [panStart, zoom, pan, setPan]
  );

  // 팬을 종료합니다.
  const stopPanning = useCallback(() => {
    if (initialPan !== null) {
      savePanAction(initialPan, pan);
    }

    setPanStart(null);
    setInitialPan(null);
    setIsPanning(false);
  }, [initialPan, pan, savePanAction, setIsPanning]);

  return {
    startPanning,
    doPanning,
    stopPanning,
  };
};
