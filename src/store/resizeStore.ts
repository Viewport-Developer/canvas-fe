import { create } from "zustand";
import type { Path, Shape, Text, ResizeSelected } from "../types";
import {
  scalePathByCombinedBoundingBox,
  scaleShapeByCombinedBoundingBox,
  scaleTextByCombinedBoundingBox,
} from "../utils";
import { pushPathToYjs, pushShapeToYjs, pushTextToYjs } from "../utils/yjsSync.utils";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import { useYjsConnectionStore } from "./yjsStore";
import { useSelectionStore } from "./selectionStore";

export type ResizeStore = {
  resizeSelected: (resizeSelected: ResizeSelected) => void;
};

export const useResizeStore = create<ResizeStore>(() => ({
  resizeSelected: ({ newBoundingBox, initialBoundingBox, initialPaths, initialShapes, initialTexts, resizeHandle }) => {
    const { yjsData } = useYjsConnectionStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (!yjsData) return;

    const pathStore = usePathStore.getState();
    const shapeStore = useShapeStore.getState();
    const textStore = useTextStore.getState();

    // 변경된 요소들 수집
    const updatedPaths = pathStore.paths
      .filter((path) => selectionStore.selectedPaths.has(path.id))
      .map((path) => {
        const initialPath = initialPaths.find((p) => p.id === path.id);
        if (!initialPath) return null;

        return scalePathByCombinedBoundingBox(
          initialPath,
          initialPath.boundingBox,
          initialBoundingBox,
          newBoundingBox
        );
      })
      .filter((path) => path !== null) as Path[];

    const updatedShapes = shapeStore.shapes
      .filter((shape) => selectionStore.selectedShapes.has(shape.id))
      .map((shape) => {
        const initialShape = initialShapes.find((s) => s.id === shape.id);
        if (!initialShape) return null;

        return scaleShapeByCombinedBoundingBox(
          initialShape,
          initialShape.boundingBox,
          initialBoundingBox,
          newBoundingBox
        );
      })
      .filter((shape) => shape !== null) as Shape[];

    const updatedTexts = textStore.texts
      .filter((text) => selectionStore.selectedTexts.has(text.id))
      .map((text) => {
        const initialText = initialTexts.find((t) => t.id === text.id);
        if (!initialText) return null;

        return scaleTextByCombinedBoundingBox(
          initialText,
          initialText.boundingBox,
          initialBoundingBox,
          newBoundingBox,
          resizeHandle
        );
      })
      .filter((text) => text !== null) as Text[];

    // 변경된 요소가 없으면 종료
    if (updatedPaths.length === 0 && updatedShapes.length === 0 && updatedTexts.length === 0) {
      return;
    }

    // 하나의 transact로 모든 변경사항 처리
    const doc = yjsData.paths.doc || yjsData.shapes.doc || yjsData.texts.doc;
    doc?.transact(() => {
      updatedPaths.forEach((path) => pushPathToYjs(path));
      updatedShapes.forEach((shape) => pushShapeToYjs(shape));
      updatedTexts.forEach((text) => pushTextToYjs(text));
    });
  },
}));
