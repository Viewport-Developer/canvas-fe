import { useState } from "react";
import type { Point } from "../types";
import { useCanvasStore } from "../store/canvasStore";
import { useToolStore } from "../store/toolStore";
import { useHistoryStore } from "../store/historyStore";

// 캔버스 팬(이동) 훅
// 마우스 드래그로 캔버스를 이동하는 기능을 제공합니다.
export const usePan = () => {
  const { setIsPanning } = useToolStore();
  const { zoom, pan, setPan } = useCanvasStore();
  const { savePanAction } = useHistoryStore();

  const [panStart, setPanStart] = useState<Point | null>(null);
  const [initialPan, setInitialPan] = useState<Point | null>(null);

  // 팬을 시작합니다.
  const startPanning = (e: React.MouseEvent) => {
    setPanStart({ x: e.clientX, y: e.clientY });
    setInitialPan({ ...pan });
    setIsPanning(true);
  };

  // 팬을 계속합니다.
  // 줌 레벨을 고려하여 캔버스 좌표계로 변환합니다.
  const doPanning = (e: React.MouseEvent) => {
    if (!panStart) return;

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    // 화면 좌표를 캔버스 좌표로 변환 (줌 고려)
    const canvasDx = dx / zoom;
    const canvasDy = dy / zoom;

    setPan({
      x: pan.x - canvasDx,
      y: pan.y - canvasDy,
    });

    setPanStart({ x: e.clientX, y: e.clientY });
  };

  // 팬을 종료합니다.
  // 변경사항이 있으면 히스토리에 저장합니다.
  const stopPanning = () => {
    if (initialPan !== null) {
      const panChanged = initialPan.x !== pan.x || initialPan.y !== pan.y;

      if (panChanged) {
        savePanAction(initialPan, pan);
      }
    }

    setPanStart(null);
    setInitialPan(null);
    setIsPanning(false);
  };

  return {
    startPanning,
    doPanning,
    stopPanning,
  };
};
