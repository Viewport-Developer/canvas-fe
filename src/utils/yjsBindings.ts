import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
import { useYjsConnectionStore } from "../store/yjsStore";
import type { YjsCanvasData, AwarenessState, AwarenessLike, Shape, Path, Text, RemoteCursor } from "../types";

const getCursorColor = (clientId: number): string => `hsl(${(clientId * 137.508) % 360}, 70%, 50%)`;

export const bindYjsToZustand = (yjsData: YjsCanvasData, awareness: AwarenessLike) => {
  const pathStore = usePathStore.getState();
  const shapeStore = useShapeStore.getState();
  const textStore = useTextStore.getState();

  // Y.js 문서의 초기 데이터를 Zustand 스토어에 로드
  pathStore.setPaths(yjsData.paths.toArray());
  shapeStore.setShapes(yjsData.shapes.toArray());
  textStore.setTexts(yjsData.texts.toArray());

  // Y.js paths/shapes/texts 변경 시 스토어에 반영
  const pathsObserver = () => {
    pathStore.setPaths(yjsData.paths.toArray());
  };

  const shapesObserver = () => {
    shapeStore.setShapes(yjsData.shapes.toArray());
  };

  const textsObserver = () => {
    textStore.setTexts(yjsData.texts.toArray());
  };

  yjsData.paths.observe(pathsObserver);
  yjsData.shapes.observe(shapesObserver);
  yjsData.texts.observe(textsObserver);

  // Awareness 변경 시 currentPaths/currentShapes/currentTexts, remoteCursors 반영
  const awarenessChangeHandler = () => {
    const states = awareness.getStates();
    const currentPaths: Path[] = [];
    const currentShapes: Shape[] = [];
    const currentTexts: Text[] = [];
    const remoteCursorsMap = new Map<number, RemoteCursor>();
    const myClientId = useYjsConnectionStore.getState().clientId;

    for (const [clientId, state] of states.entries()) {
      const s = state as AwarenessState;
      if (s.currentPath) currentPaths.push(s.currentPath);
      if (s.currentShape) currentShapes.push(s.currentShape);
      if (s.currentText) currentTexts.push(s.currentText);
      if (clientId !== myClientId && s.cursor) {
        remoteCursorsMap.set(clientId, {
          position: s.cursor,
          color: getCursorColor(clientId),
        });
      }
    }

    pathStore.setCurrentPaths(currentPaths);
    shapeStore.setCurrentShapes(currentShapes);
    textStore.setCurrentTexts(currentTexts);
    useYjsConnectionStore.getState().setRemoteCursors(remoteCursorsMap);
  };

  awareness.on("change", awarenessChangeHandler);

  return () => {
    yjsData.paths.unobserve(pathsObserver);
    yjsData.shapes.unobserve(shapesObserver);
    yjsData.texts.unobserve(textsObserver);
    awareness.off("change", awarenessChangeHandler);
  };
};
