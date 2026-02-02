import { useYjsConnectionStore } from "../store/yjsStore";
import type { Path, Shape, Text } from "../types";

export const getCurrentPathFromAwareness = (): Path | null => {
  const { awareness } = useYjsConnectionStore.getState();
  return awareness!.getLocalState()!.currentPath!;
};

export const getCurrentShapeFromAwareness = (): Shape | null => {
  const { awareness } = useYjsConnectionStore.getState();
  return awareness!.getLocalState()!.currentShape!;
};

export const getCurrentTextFromAwareness = (): Text | null => {
  const { awareness } = useYjsConnectionStore.getState();
  return awareness!.getLocalState()!.currentText!;
};

export const setCurrentPathToAwareness = (currentPath: Path | null): void => {
  const { awareness } = useYjsConnectionStore.getState();
  awareness!.setLocalStateField("currentPath", currentPath);
};

export const setCurrentShapeToAwareness = (currentShape: Shape | null): void => {
  const { awareness } = useYjsConnectionStore.getState();
  awareness!.setLocalStateField("currentShape", currentShape);
};

export const setCurrentTextToAwareness = (currentText: Text | null): void => {
  const { awareness } = useYjsConnectionStore.getState();
  awareness!.setLocalStateField("currentText", currentText);
};

export const pushPathToYjs = (path: Path): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  yjsData!.paths.set(path.id, path);
};

export const removePathsFromYjs = (ids: string[]): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  ids.forEach((id) => yjsData!.paths.delete(id));
};

export const pushShapeToYjs = (shape: Shape): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  yjsData!.shapes.set(shape.id, shape);
};

export const removeShapesFromYjs = (ids: string[]): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  ids.forEach((id) => yjsData!.shapes.delete(id));
};

export const pushTextToYjs = (text: Text): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  yjsData!.texts.set(text.id, text);
};

export const removeTextsFromYjs = (ids: string[]): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  ids.forEach((id) => yjsData!.texts.delete(id));
};
