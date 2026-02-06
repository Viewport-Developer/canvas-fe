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
  resizeSelected: ({ type, newBoundingBox, initialBoundingBox, initialItems, resizeHandle }) => {
    const { yjsData } = useYjsConnectionStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (!yjsData) return;

    if (type === "path") {
      if (selectionStore.selectedPaths.size === 0) return;

      const pathStore = usePathStore.getState();
      const pathsArray = pathStore.paths;
      const initialPaths = initialItems as Path[];

      const updatedPaths = pathsArray
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

      yjsData.paths.doc?.transact(() => {
        updatedPaths.forEach((path) => pushPathToYjs(path));
      });
      return;
    }

    if (type === "shape") {
      if (selectionStore.selectedShapes.size === 0) return;

      const shapeStore = useShapeStore.getState();
      const shapesArray = shapeStore.shapes;
      const initialShapes = initialItems as Shape[];

      const updatedShapes = shapesArray
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

      yjsData.shapes.doc?.transact(() => {
        updatedShapes.forEach((shape) => pushShapeToYjs(shape));
      });
      return;
    }

    if (type === "text") {
      if (selectionStore.selectedTexts.size === 0) return;

      const textStore = useTextStore.getState();
      const textsArray = textStore.texts;
      const initialTexts = initialItems as Text[];

      const updatedTexts = textsArray
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

      yjsData.texts.doc?.transact(() => {
        updatedTexts.forEach((text) => pushTextToYjs(text));
      });
    }
  },
}));
