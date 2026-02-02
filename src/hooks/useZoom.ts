import { useEffect, type RefObject } from "react";
import { useShallow } from "zustand/react/shallow";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { useViewportStore } from "../store/viewportStore";

export const useZoom = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
  const [zoom, setZoom, pan, setPan] = useViewportStore(useShallow((s) => [s.zoom, s.setZoom, s.pan, s.setPan]));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      // Ctrl 키를 누른 상태에서만 줌 동작
      if (!e.ctrlKey) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();

      // 마우스 위치를 캔버스 좌표로 변환
      const mouseX = (e.clientX - rect.left) / zoom + pan.x;
      const mouseY = (e.clientY - rect.top) / zoom + pan.y;

      // 줌 델타 계산
      const delta = e.deltaY > 0 ? CANVAS_CONFIG.ZOOM_DELTA_OUT : CANVAS_CONFIG.ZOOM_DELTA_IN;

      // 새로운 줌 레벨 계산 (최소/최대 제한)
      const newZoom = Math.max(CANVAS_CONFIG.MIN_ZOOM, Math.min(CANVAS_CONFIG.MAX_ZOOM, zoom * delta));

      // 새로운 줌 레벨에서의 마우스 위치 계산
      const mouseXAfter = (e.clientX - rect.left) / newZoom + pan.x;
      const mouseYAfter = (e.clientY - rect.top) / newZoom + pan.y;

      // 팬 오프셋 조정 (마우스 위치를 기준으로 줌)
      const newPanX = pan.x - (mouseXAfter - mouseX);
      const newPanY = pan.y - (mouseYAfter - mouseY);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [canvasRef, zoom, pan, setZoom, setPan]);
};
