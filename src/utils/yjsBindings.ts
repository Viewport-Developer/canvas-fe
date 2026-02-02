import * as Y from "yjs";
import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
import { useYjsConnectionStore } from "../store/yjsStore";
import type { YjsCanvasData, AwarenessState, AwarenessLike, Shape, Path, Text, RemoteCursor } from "../types";

const getCursorColor = (clientId: number): string => `hsl(${(clientId * 137.508) % 360}, 70%, 50%)`;

// Y.Map → 배열로 변환
const yMapToPathsArray = (yMap: Y.Map<Path>): Path[] => Array.from(yMap.values());
const yMapToShapesArray = (yMap: Y.Map<Shape>): Shape[] => Array.from(yMap.values());
const yMapToTextsArray = (yMap: Y.Map<Text>): Text[] => Array.from(yMap.values());

export const bindYjsToZustand = (yjsData: YjsCanvasData, awareness: AwarenessLike) => {
  const pathStore = usePathStore.getState();
  const shapeStore = useShapeStore.getState();
  const textStore = useTextStore.getState();

  // Y.Map 데이터를 배열로 변환해 Zustand에 로드
  pathStore.setPaths(yMapToPathsArray(yjsData.paths));
  shapeStore.setShapes(yMapToShapesArray(yjsData.shapes));
  textStore.setTexts(yMapToTextsArray(yjsData.texts));

  // Y.Map 변경 시 배열로 변환해 스토어에 반영
  const pathsObserver = () => {
    pathStore.setPaths(yMapToPathsArray(yjsData.paths));
  };

  const shapesObserver = () => {
    shapeStore.setShapes(yMapToShapesArray(yjsData.shapes));
  };

  const textsObserver = () => {
    textStore.setTexts(yMapToTextsArray(yjsData.texts));
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
