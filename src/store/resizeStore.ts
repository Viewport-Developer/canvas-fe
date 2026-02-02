import { create } from "zustand";
import type { Path, Shape, Text, ResizeSelected } from "../types";
import {
  scalePathByCombinedBoundingBox,
  scaleShapeByCombinedBoundingBox,
  scaleTextByCombinedBoundingBox,
} from "../utils";
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

      const updatedPaths = pathsArray.map((path) => {
        if (!selectionStore.selectedPaths.has(path.id)) return path;

        const initialPath = initialPaths.find((p) => p.id === path.id);
        if (!initialPath) return path;

        return scalePathByCombinedBoundingBox(
          initialPath,
          initialPath.boundingBox,
          initialBoundingBox,
          newBoundingBox
        );
      });

      yjsData.paths.doc?.transact(() => {
        for (let i = 0; i < pathsArray.length; i++) {
          if (selectionStore.selectedPaths.has(pathsArray[i].id)) {
            yjsData.paths.set(pathsArray[i].id, updatedPaths[i]);
          }
        }
      });
      return;
    }

    if (type === "shape") {
      if (selectionStore.selectedShapes.size === 0) return;

      const shapeStore = useShapeStore.getState();
      const shapesArray = shapeStore.shapes;
      const initialShapes = initialItems as Shape[];

      const updatedShapes = shapesArray.map((shape) => {
        if (!selectionStore.selectedShapes.has(shape.id)) return shape;

        const initialShape = initialShapes.find((s) => s.id === shape.id);
        if (!initialShape) return shape;

        return scaleShapeByCombinedBoundingBox(
          initialShape,
          initialShape.boundingBox,
          initialBoundingBox,
          newBoundingBox
        );
      });

      yjsData.shapes.doc?.transact(() => {
        for (let i = 0; i < shapesArray.length; i++) {
          if (selectionStore.selectedShapes.has(shapesArray[i].id)) {
            yjsData.shapes.set(shapesArray[i].id, updatedShapes[i]);
          }
        }
      });
      return;
    }

    if (type === "text") {
      if (selectionStore.selectedTexts.size === 0) return;

      const textStore = useTextStore.getState();
      const textsArray = textStore.texts;
      const initialTexts = initialItems as Text[];

      const updatedTexts = textsArray.map((text) => {
        if (!selectionStore.selectedTexts.has(text.id)) return text;

        const initialText = initialTexts.find((t) => t.id === text.id);
        if (!initialText) return text;

        return scaleTextByCombinedBoundingBox(
          initialText,
          initialText.boundingBox,
          initialBoundingBox,
          newBoundingBox,
          resizeHandle
        );
      });

      yjsData.texts.doc?.transact(() => {
        for (let i = 0; i < textsArray.length; i++) {
          if (selectionStore.selectedTexts.has(textsArray[i].id)) {
            yjsData.texts.set(textsArray[i].id, updatedTexts[i]);
          }
        }
      });
    }
  },
}));
