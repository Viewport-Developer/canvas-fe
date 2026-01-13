import { create } from "zustand";
import type { BoundingBox, Path, Shape } from "../types";
import {
  scalePathToBoundingBox,
  scaleShapeToBoundingBox,
  scalePathByCombinedBoundingBox,
  scaleShapeByCombinedBoundingBox,
} from "../utils/scaling.utils";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useSelectionStore } from "./selectionStore";

interface ResizeStore {
  resizeSelectedPaths: (newBoundingBox: BoundingBox, initialBoundingBox?: BoundingBox, initialPaths?: Path[]) => void;
  resizeSelectedShapes: (
    newBoundingBox: BoundingBox,
    initialBoundingBox?: BoundingBox,
    initialShapes?: Shape[]
  ) => void;
}

export const useResizeStore = create<ResizeStore>(() => ({
  resizeSelectedPaths: (newBoundingBox, initialBoundingBox, initialPaths) => {
    const pathStore = usePathStore.getState();
    const selectionStore = useSelectionStore.getState();

    if (selectionStore.selectedPathIds.length === 0) return;

    // 전체 선택된 요소 개수 확인 (path + shape)
    const totalSelectedCount = selectionStore.selectedPathIds.length + selectionStore.selectedShapeIds.length;

    // 결합된 바운딩 박스를 리사이징하는 경우 (전체 선택된 요소가 2개 이상일 때)
    if (initialBoundingBox && initialPaths && totalSelectedCount > 1) {
      const updatedPaths = pathStore.paths.map((path) => {
        if (!selectionStore.selectedPathIds.includes(path.id)) return path;

        // 초기 상태에서 해당 경로 찾기
        const initialPath = initialPaths.find((p) => p.id === path.id);
        if (!initialPath) return path;

        return scalePathByCombinedBoundingBox(initialPath, initialPath.boundingBox, initialBoundingBox, newBoundingBox);
      });

      usePathStore.setState({ paths: updatedPaths });
    } else {
      // 단일 요소 리사이징 또는 결합된 바운딩 박스 정보가 없는 경우
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

    // 전체 선택된 요소 개수 확인 (path + shape)
    const totalSelectedCount = selectionStore.selectedPathIds.length + selectionStore.selectedShapeIds.length;

    // 결합된 바운딩 박스를 리사이징하는 경우 (전체 선택된 요소가 2개 이상일 때)
    if (initialBoundingBox && initialShapes && totalSelectedCount > 1) {
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
      // 단일 요소 리사이징 또는 결합된 바운딩 박스 정보가 없는 경우
      const updatedShapes = shapeStore.shapes.map((shape) => {
        if (!selectionStore.selectedShapeIds.includes(shape.id)) return shape;
        return scaleShapeToBoundingBox(shape, shape.boundingBox, newBoundingBox);
      });

      useShapeStore.setState({ shapes: updatedShapes });
    }
  },
}));
