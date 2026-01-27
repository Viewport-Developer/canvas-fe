import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import type { YjsCanvasData } from "./yjsStore";
import { getGlobalClientId } from "./yjsStore";

// y.js → Zustand 단방향 바인딩 (y.js 변경사항을 Zustand에 반영)
export const bindYjsToZustand = (yjsData: YjsCanvasData) => {
  const pathStore = usePathStore.getState();
  const shapeStore = useShapeStore.getState();
  const textStore = useTextStore.getState();

  // 초기 상태 동기화: y.js → Zustand
  pathStore.setPaths(yjsData.paths.toArray());
  shapeStore.setShapes(yjsData.shapes.toArray());
  textStore.setTexts(yjsData.texts.toArray());

  // 다른 사용자의 currentPath를 paths에 병합하여 표시
  const updatePathsWithCurrentPaths = () => {
    const completedPaths = yjsData.paths.toArray();
    const currentPaths = yjsData.currentPaths.toArray();
    const clientId = getGlobalClientId();
    
    // 다른 사용자의 currentPath를 completedPaths에 추가 (임시 표시용)
    const allPaths = [...completedPaths];
    currentPaths.forEach((cp) => {
      // 자신의 currentPath는 제외 (이미 로컬에서 표시됨)
      if (cp.clientId !== clientId) {
        allPaths.push(cp.path);
      }
    });
    
    pathStore.setPaths(allPaths, true);
  };

  // y.js 변경사항 감지: y.js → Zustand (무한 루프 방지를 위해 skipYjsSync=true)
  const pathsObserver = () => {
    updatePathsWithCurrentPaths();
  };

  const currentPathsObserver = () => {
    updatePathsWithCurrentPaths();
  };

  // 다른 사용자의 currentShape를 shapes에 병합하여 표시
  const updateShapesWithCurrentShapes = () => {
    const completedShapes = yjsData.shapes.toArray();
    const currentShapes = yjsData.currentShapes.toArray();
    const clientId = getGlobalClientId();
    
    // 다른 사용자의 currentShape를 completedShapes에 추가 (임시 표시용)
    const allShapes = [...completedShapes];
    currentShapes.forEach((cs) => {
      // 자신의 currentShape는 제외 (이미 로컬에서 표시됨)
      if (cs.clientId !== clientId) {
        allShapes.push(cs.shape);
      }
    });
    
    shapeStore.setShapes(allShapes, true);
  };

  const shapesObserver = () => {
    updateShapesWithCurrentShapes();
  };

  const currentShapesObserver = () => {
    updateShapesWithCurrentShapes();
  };

  const textsObserver = () => {
    const currentTexts = yjsData.texts.toArray();
    textStore.setTexts(currentTexts, true);
  };

  yjsData.paths.observe(pathsObserver);
  yjsData.currentPaths.observe(currentPathsObserver);
  yjsData.shapes.observe(shapesObserver);
  yjsData.currentShapes.observe(currentShapesObserver);
  yjsData.texts.observe(textsObserver);

  // 초기 currentPaths와 currentShapes 반영
  updatePathsWithCurrentPaths();
  updateShapesWithCurrentShapes();

  // 정리 함수
  return () => {
    yjsData.paths.unobserve(pathsObserver);
    yjsData.currentPaths.unobserve(currentPathsObserver);
    yjsData.shapes.unobserve(shapesObserver);
    yjsData.currentShapes.unobserve(currentShapesObserver);
    yjsData.texts.unobserve(textsObserver);
  };
};
