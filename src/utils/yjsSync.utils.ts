import { useYjsConnectionStore } from "../store/yjsStore";
import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
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
  const { yjsData, awareness } = useYjsConnectionStore.getState();

  // 오프라인일 때는 zustand에만 적용
  if (!awareness || !yjsData) {
    const pathStore = usePathStore.getState();
    const currentPaths = pathStore.paths;
    const existingIndex = currentPaths.findIndex((p) => p.id === path.id);

    if (existingIndex >= 0) {
      const updatedPaths = [...currentPaths];
      updatedPaths[existingIndex] = path;
      pathStore.setPaths(updatedPaths);
    } else {
      pathStore.setPaths([...currentPaths, path]);
    }
    return;
  }

  // 온라인일 때는 yjsData에 적용
  yjsData.paths.set(path.id, path);
};

export const removePathsFromYjs = (ids: string[]): void => {
  const { yjsData, awareness } = useYjsConnectionStore.getState();

  // 오프라인일 때는 zustand에서만 제거
  if (!awareness || !yjsData) {
    const pathStore = usePathStore.getState();
    const filteredPaths = pathStore.paths.filter((path) => !ids.includes(path.id));
    pathStore.setPaths(filteredPaths);
    return;
  }

  // 온라인일 때는 yjsData에서 제거
  ids.forEach((id) => yjsData.paths.delete(id));
};

export const pushShapeToYjs = (shape: Shape): void => {
  const { yjsData, awareness } = useYjsConnectionStore.getState();

  // 오프라인일 때는 zustand에만 적용
  if (!awareness || !yjsData) {
    const shapeStore = useShapeStore.getState();
    const currentShapes = shapeStore.shapes;
    const existingIndex = currentShapes.findIndex((s) => s.id === shape.id);

    if (existingIndex >= 0) {
      const updatedShapes = [...currentShapes];
      updatedShapes[existingIndex] = shape;
      shapeStore.setShapes(updatedShapes);
    } else {
      shapeStore.setShapes([...currentShapes, shape]);
    }
    return;
  }

  // 온라인일 때는 yjsData에 적용
  yjsData.shapes.set(shape.id, shape);
};

export const removeShapesFromYjs = (ids: string[]): void => {
  const { yjsData, awareness } = useYjsConnectionStore.getState();

  // 오프라인일 때는 zustand에서만 제거
  if (!awareness || !yjsData) {
    const shapeStore = useShapeStore.getState();
    const filteredShapes = shapeStore.shapes.filter((shape) => !ids.includes(shape.id));
    shapeStore.setShapes(filteredShapes);
    return;
  }

  // 온라인일 때는 yjsData에서 제거
  ids.forEach((id) => yjsData.shapes.delete(id));
};

export const pushTextToYjs = (text: Text): void => {
  const { yjsData, awareness } = useYjsConnectionStore.getState();

  // 오프라인일 때는 zustand에만 적용
  if (!awareness || !yjsData) {
    const textStore = useTextStore.getState();
    const currentTexts = textStore.texts;
    const existingIndex = currentTexts.findIndex((t) => t.id === text.id);

    if (existingIndex >= 0) {
      const updatedTexts = [...currentTexts];
      updatedTexts[existingIndex] = text;
      textStore.setTexts(updatedTexts);
    } else {
      textStore.setTexts([...currentTexts, text]);
    }
    return;
  }

  // 온라인일 때는 yjsData에 적용
  yjsData.texts.set(text.id, text);
};

export const removeTextsFromYjs = (ids: string[]): void => {
  const { yjsData, awareness } = useYjsConnectionStore.getState();

  // 오프라인일 때는 zustand에서만 제거
  if (!awareness || !yjsData) {
    const textStore = useTextStore.getState();
    const filteredTexts = textStore.texts.filter((text) => !ids.includes(text.id));
    textStore.setTexts(filteredTexts);
    return;
  }

  // 온라인일 때는 yjsData에서 제거
  ids.forEach((id) => yjsData.texts.delete(id));
};
