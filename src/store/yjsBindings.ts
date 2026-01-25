import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import type { YjsCanvasData } from "./yjsStore";

// y.js → Zustand 단방향 바인딩 (y.js 변경사항을 Zustand에 반영)
export const bindYjsToZustand = (yjsData: YjsCanvasData) => {
  const pathStore = usePathStore.getState();
  const shapeStore = useShapeStore.getState();
  const textStore = useTextStore.getState();

  // 초기 상태 동기화: y.js → Zustand
  pathStore.setPaths(yjsData.paths.toArray());
  shapeStore.setShapes(yjsData.shapes.toArray());
  textStore.setTexts(yjsData.texts.toArray());

  // y.js 변경사항 감지: y.js → Zustand (무한 루프 방지를 위해 skipYjsSync=true)
  const pathsObserver = () => {
    const currentPaths = yjsData.paths.toArray();
    pathStore.setPaths(currentPaths, true);
  };

  const shapesObserver = () => {
    const currentShapes = yjsData.shapes.toArray();
    shapeStore.setShapes(currentShapes, true);
  };

  const textsObserver = () => {
    const currentTexts = yjsData.texts.toArray();
    textStore.setTexts(currentTexts, true);
  };

  yjsData.paths.observe(pathsObserver);
  yjsData.shapes.observe(shapesObserver);
  yjsData.texts.observe(textsObserver);

  // 정리 함수
  return () => {
    yjsData.paths.unobserve(pathsObserver);
    yjsData.shapes.unobserve(shapesObserver);
    yjsData.texts.unobserve(textsObserver);
  };
};
