import { create } from "zustand";
import type { Point } from "../types";
import { movePath, moveShape, moveText } from "../utils";
import { pushPathToYjs, pushShapeToYjs, pushTextToYjs } from "../utils/yjsSync.utils";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import { useSelectionStore } from "./selectionStore";
import { useYjsConnectionStore } from "./yjsStore";

export type MoveStore = {
  moveSelected: (offset: Point) => void;
};

export const useMoveStore = create<MoveStore>(() => ({
  moveSelected: (offset) => {
    const { yjsData } = useYjsConnectionStore.getState();
    const selectionStore = useSelectionStore.getState();
    if (!yjsData) return;

    const pathStore = usePathStore.getState();
    const shapeStore = useShapeStore.getState();
    const textStore = useTextStore.getState();

    // 변경된 요소들 수집
    const movedPaths = pathStore.paths
      .filter((path) => selectionStore.selectedPaths.has(path.id))
      .map((path) => movePath(path, offset));

    const movedShapes = shapeStore.shapes
      .filter((shape) => selectionStore.selectedShapes.has(shape.id))
      .map((shape) => moveShape(shape, offset));

    const movedTexts = textStore.texts
      .filter((text) => selectionStore.selectedTexts.has(text.id))
      .map((text) => moveText(text, offset));

    // 변경된 요소가 없으면 종료
    if (movedPaths.length === 0 && movedShapes.length === 0 && movedTexts.length === 0) {
      return;
    }

    // 하나의 transact로 모든 변경사항 처리
    const doc = yjsData.paths.doc || yjsData.shapes.doc || yjsData.texts.doc;
    doc?.transact(() => {
      movedPaths.forEach((path) => pushPathToYjs(path));
      movedShapes.forEach((shape) => pushShapeToYjs(shape));
      movedTexts.forEach((text) => pushTextToYjs(text));
    });
  },
}));
