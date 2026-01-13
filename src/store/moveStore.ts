import { create } from "zustand";
import type { Point } from "../types";
import { movePath, moveShape } from "../utils/move.utils";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useSelectionStore } from "./selectionStore";

interface MoveStore {
  moveSelectedPaths: (offset: Point) => void;
  moveSelectedShapes: (offset: Point) => void;
}

export const useMoveStore = create<MoveStore>(() => ({
  moveSelectedPaths: (offset) => {
    const pathStore = usePathStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedPathIds.length === 0) return;

    const updatedPaths = pathStore.paths.map((path) => {
      if (!selectionStore.selectedPathIds.includes(path.id)) return path;
      return movePath(path, offset);
    });

    usePathStore.setState({ paths: updatedPaths });
  },

  moveSelectedShapes: (offset) => {
    const shapeStore = useShapeStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedShapeIds.length === 0) return;

    const updatedShapes = shapeStore.shapes.map((shape) => {
      if (!selectionStore.selectedShapeIds.includes(shape.id)) return shape;
      return moveShape(shape, offset);
    });

    useShapeStore.setState({ shapes: updatedShapes });
  },
}));
