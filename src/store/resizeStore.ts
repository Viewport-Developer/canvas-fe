import { create } from "zustand";
import type { BoundingBox, Path, Shape, Text, ResizeHandleType } from "../types";
import {
  scalePathToBoundingBox,
  scaleShapeToBoundingBox,
  scalePathByCombinedBoundingBox,
  scaleShapeByCombinedBoundingBox,
  scaleTextToBoundingBox,
  scaleTextByCombinedBoundingBox,
} from "../utils/scaling.utils";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import { useSelectionStore } from "./selectionStore";

interface ResizeStore {
  resizeSelectedPaths: (newBoundingBox: BoundingBox, initialBoundingBox?: BoundingBox, initialPaths?: Path[]) => void;
  resizeSelectedShapes: (
    newBoundingBox: BoundingBox,
    initialBoundingBox?: BoundingBox,
    initialShapes?: Shape[]
  ) => void;
  resizeSelectedTexts: (
    newBoundingBox: BoundingBox,
    initialBoundingBox?: BoundingBox,
    initialTexts?: Text[],
    resizeHandle?: ResizeHandleType
  ) => void;
}

export const useResizeStore = create<ResizeStore>(() => ({
  resizeSelectedPaths: (newBoundingBox, initialBoundingBox, initialPaths) => {
    const pathStore = usePathStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedPathIds.length === 0) return;

    // 결합된 바운딩 박스를 리사이징하는 경우
    if (initialBoundingBox && initialPaths) {
      const updatedPaths = pathStore.paths.map((path) => {
        if (!selectionStore.selectedPathIds.includes(path.id)) return path;

        // 초기 상태에서 해당 경로 찾기
        const initialPath = initialPaths.find((p) => p.id === path.id);
        if (!initialPath) return path;

        return scalePathByCombinedBoundingBox(initialPath, initialPath.boundingBox, initialBoundingBox, newBoundingBox);
      });

      usePathStore.setState({ paths: updatedPaths });
    } else {
      // 단일 요소 리사이징
      const updatedPaths = pathStore.paths.map((path) => {
        if (!selectionStore.selectedPathIds.includes(path.id)) return path;
        return scalePathToBoundingBox(path, path.boundingBox, newBoundingBox);
      });

      usePathStore.setState({ paths: updatedPaths });
    }
  },

  resizeSelectedShapes: (newBoundingBox, initialBoundingBox, initialShapes) => {
    const shapeStore = useShapeStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedShapeIds.length === 0) return;

    // 결합된 바운딩 박스를 리사이징하는 경우
    if (initialBoundingBox && initialShapes) {
      const updatedShapes = shapeStore.shapes.map((shape) => {
        if (!selectionStore.selectedShapeIds.includes(shape.id)) return shape;

        // 초기 상태에서 해당 도형 찾기
        const initialShape = initialShapes.find((s) => s.id === shape.id);
        if (!initialShape) return shape;

        return scaleShapeByCombinedBoundingBox(
          initialShape,
          initialShape.boundingBox,
          initialBoundingBox,
          newBoundingBox
        );
      });

      useShapeStore.setState({ shapes: updatedShapes });
    } else {
      // 단일 요소 리사이징
      const updatedShapes = shapeStore.shapes.map((shape) => {
        if (!selectionStore.selectedShapeIds.includes(shape.id)) return shape;
        return scaleShapeToBoundingBox(shape, shape.boundingBox, newBoundingBox);
      });

      useShapeStore.setState({ shapes: updatedShapes });
    }
  },

  resizeSelectedTexts: (newBoundingBox, initialBoundingBox, initialTexts, resizeHandle) => {
    const textStore = useTextStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedTextIds.length === 0) return;

    if (initialBoundingBox && initialTexts) {
      const updatedTexts = textStore.texts.map((text) => {
        if (!selectionStore.selectedTextIds.includes(text.id)) return text;

        // 초기 상태에서 해당 텍스트 찾기
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

      useTextStore.setState({ texts: updatedTexts });
    } else {
      // 단일 요소 리사이징
      const updatedTexts = textStore.texts.map((text) => {
        if (!selectionStore.selectedTextIds.includes(text.id)) return text;
        return scaleTextToBoundingBox(text, text.boundingBox, newBoundingBox, resizeHandle);
      });

      useTextStore.setState({ texts: updatedTexts });
    }
  },
}));
