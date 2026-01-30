import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
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
  yjsData!.paths.push([path]);
};

export const removePathsFromYjs = (ids: string[]): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  const paths = usePathStore.getState().paths;
  const indicesToRemove = ids.map((id) => paths.findIndex((p) => p.id === id)).sort((a, b) => b - a);

  for (const i of indicesToRemove) {
    yjsData!.paths.delete(i, 1);
  }
};

export const pushShapeToYjs = (shape: Shape): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  yjsData!.shapes.push([shape]);
};

export const removeShapesFromYjs = (ids: string[]): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  const shapes = useShapeStore.getState().shapes;
  const indicesToRemove = ids.map((id) => shapes.findIndex((s) => s.id === id)).sort((a, b) => b - a);

  for (const i of indicesToRemove) {
    yjsData!.shapes.delete(i, 1);
  }
};

export const pushTextToYjs = (text: Text): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  yjsData!.texts.push([text]);
};

export const removeTextsFromYjs = (ids: string[]): void => {
  const { yjsData } = useYjsConnectionStore.getState();
  const texts = useTextStore.getState().texts;
  const indicesToRemove = ids.map((id) => texts.findIndex((t) => t.id === id)).sort((a, b) => b - a);

  for (const i of indicesToRemove) {
    yjsData!.texts.delete(i, 1);
  }
};
