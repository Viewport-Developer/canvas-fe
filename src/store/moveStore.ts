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
  moveSelected: (type: "path" | "shape" | "text", offset: Point) => void;
};

export const useMoveStore = create<MoveStore>(() => ({
  moveSelected: (type, offset) => {
    const { yjsData } = useYjsConnectionStore.getState();
    const selectionStore = useSelectionStore.getState();
    if (!yjsData) return;

    if (type === "path") {
      const pathStore = usePathStore.getState();
      if (selectionStore.selectedPaths.size === 0) return;

      const movedPaths = pathStore.paths
        .filter((path) => selectionStore.selectedPaths.has(path.id))
        .map((path) => movePath(path, offset));

      yjsData.paths.doc?.transact(() => {
        movedPaths.forEach((path) => pushPathToYjs(path));
      });
      return;
    }

    if (type === "shape") {
      const shapeStore = useShapeStore.getState();
      if (selectionStore.selectedShapes.size === 0) return;

      const movedShapes = shapeStore.shapes
        .filter((shape) => selectionStore.selectedShapes.has(shape.id))
        .map((shape) => moveShape(shape, offset));

      yjsData.shapes.doc?.transact(() => {
        movedShapes.forEach((shape) => pushShapeToYjs(shape));
      });
      return;
    }

    if (type === "text") {
      const textStore = useTextStore.getState();
      if (selectionStore.selectedTexts.size === 0) return;

      const movedTexts = textStore.texts
        .filter((text) => selectionStore.selectedTexts.has(text.id))
        .map((text) => moveText(text, offset));

      yjsData.texts.doc?.transact(() => {
        movedTexts.forEach((text) => pushTextToYjs(text));
      });
      return;
    }
  },
}));
