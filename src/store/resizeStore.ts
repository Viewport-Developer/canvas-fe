import { create } from "zustand";
import type { Path, Shape, Text, ResizeSelected } from "../types";
import {
  scalePathByBoundingBox,
  scaleShapeByBoundingBox,
  scalePathByCombinedBoundingBox,
  scaleShapeByCombinedBoundingBox,
  scaleTextToBoundingBox,
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
      const initialPaths = initialItems as Path[] | undefined;

      let updatedPaths: Path[];

      // 결합된 바운딩 박스를 리사이징하는 경우
      if (initialBoundingBox && initialPaths) {
        updatedPaths = pathsArray.map((path) => {
          if (!selectionStore.selectedPaths.has(path.id)) return path;

          const initialPath = initialPaths.find((p) => p.id === path.id);
          if (!initialPath) return path;

          return scalePathByCombinedBoundingBox(
            initialPath,
            initialPath.boundingBox,
            initialBoundingBox,
            newBoundingBox,
          );
        });
      } else {
        // 단일 요소 리사이징
        updatedPaths = pathsArray.map((path) => {
          if (!selectionStore.selectedPaths.has(path.id)) return path;
          return scalePathByBoundingBox(path, path.boundingBox, newBoundingBox);
        });
      }

      // yjsData.paths에 인덱스 역순으로 적용 (인덱스 시프트 방지)
      for (let i = pathsArray.length - 1; i >= 0; i--) {
        if (selectionStore.selectedPaths.has(pathsArray[i].id)) {
          yjsData.paths.delete(i, 1);
          yjsData.paths.insert(i, [updatedPaths[i]]);
        }
      }
      return;
    }

    if (type === "shape") {
      if (selectionStore.selectedShapes.size === 0) return;

      const shapeStore = useShapeStore.getState();
      const shapesArray = shapeStore.shapes;
      const initialShapes = initialItems as Shape[] | undefined;

      let updatedShapes: Shape[];

      // 결합된 바운딩 박스를 리사이징하는 경우
      if (initialBoundingBox && initialShapes) {
        updatedShapes = shapesArray.map((shape) => {
          if (!selectionStore.selectedShapes.has(shape.id)) return shape;

          const initialShape = initialShapes.find((s) => s.id === shape.id);
          if (!initialShape) return shape;

          return scaleShapeByCombinedBoundingBox(
            initialShape,
            initialShape.boundingBox,
            initialBoundingBox,
            newBoundingBox,
          );
        });
      } else {
        // 단일 요소 리사이징
        updatedShapes = shapesArray.map((shape) => {
          if (!selectionStore.selectedShapes.has(shape.id)) return shape;
          return scaleShapeByBoundingBox(shape, shape.boundingBox, newBoundingBox);
        });
      }

      for (let i = shapesArray.length - 1; i >= 0; i--) {
        if (selectionStore.selectedShapes.has(shapesArray[i].id)) {
          yjsData.shapes.delete(i, 1);
          yjsData.shapes.insert(i, [updatedShapes[i]]);
        }
      }
      return;
    }

    if (type === "text") {
      if (selectionStore.selectedTexts.size === 0) return;

      const textStore = useTextStore.getState();
      const textsArray = textStore.texts;
      const initialTexts = initialItems as Text[] | undefined;

      let updatedTexts: Text[];

      if (initialBoundingBox && initialTexts) {
        updatedTexts = textsArray.map((text) => {
          if (!selectionStore.selectedTexts.has(text.id)) return text;

          const initialText = initialTexts.find((t) => t.id === text.id);
          if (!initialText) return text;

          return scaleTextByCombinedBoundingBox(
            initialText,
            initialText.boundingBox,
            initialBoundingBox,
            newBoundingBox,
            resizeHandle,
          );
        });
      } else {
        // 단일 요소 리사이징
        updatedTexts = textsArray.map((text) => {
          if (!selectionStore.selectedTexts.has(text.id)) return text;
          return scaleTextToBoundingBox(text, text.boundingBox, newBoundingBox, resizeHandle);
        });
      }

      for (let i = textsArray.length - 1; i >= 0; i--) {
        if (selectionStore.selectedTexts.has(textsArray[i].id)) {
          yjsData.texts.delete(i, 1);
          yjsData.texts.insert(i, [updatedTexts[i]]);
        }
      }
    }
  },
}));
