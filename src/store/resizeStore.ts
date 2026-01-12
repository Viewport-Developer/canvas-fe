import { create } from "zustand";
import type { BoundingBox } from "../types";
import {
  scalePathToBoundingBox,
  scaleShapeToBoundingBox,
} from "../utils/scaling.utils";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useSelectionStore } from "./selectionStore";

// 리사이즈 스토어 인터페이스
interface ResizeStore {
  resizeSelectedPaths: (newBoundingBox: BoundingBox) => void;
  resizeSelectedShapes: (newBoundingBox: BoundingBox) => void;
}

export const useResizeStore = create<ResizeStore>(() => ({
  resizeSelectedPaths: (newBoundingBox) => {
    const pathStore = usePathStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedPathIds.length === 0) return;

    const updatedPaths = pathStore.paths.map((path) => {
      if (!selectionStore.selectedPathIds.includes(path.id)) return path;
      return scalePathToBoundingBox(path, path.boundingBox, newBoundingBox);
    });

    usePathStore.setState({ paths: updatedPaths });
  },

  resizeSelectedShapes: (newBoundingBox) => {
    const shapeStore = useShapeStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedShapeIds.length === 0) return;

    const updatedShapes = shapeStore.shapes.map((shape) => {
      if (!selectionStore.selectedShapeIds.includes(shape.id)) return shape;
      return scaleShapeToBoundingBox(shape, shape.boundingBox, newBoundingBox);
    });

    useShapeStore.setState({ shapes: updatedShapes });
  },
}));
