import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import { useSelectionStore } from "./selectionStore";
import { useViewportStore } from "./viewportStore";
import { useEraserStore } from "./eraserStore";
import { useResizeStore } from "./resizeStore";
import { useMoveStore } from "./moveStore";
import type { Path, Point, ResizeSelected, Shape, Text } from "../types";

export type CanvasStore = {
  paths: Path[];
  currentPaths: Path[];
  shapes: Shape[];
  currentShapes: Shape[];
  texts: Text[];
  currentTexts: Text[];
  pathsToErase: Set<string>;
  shapesToErase: Set<string>;
  textsToErase: Set<string>;
  selectedPaths: Set<string>;
  selectedShapes: Set<string>;
  selectedTexts: Set<string>;
  isDragSelecting: boolean;
  dragStartPoint: Point | null;
  dragEndPoint: Point | null;
  zoom: number;
  pan: Point;
  setPaths: (paths: Path[]) => void;
  setShapes: (shapes: Shape[]) => void;
  setTexts: (texts: Text[]) => void;
  clearToErase: () => void;
  addToErase: (type: "path" | "shape" | "text", id: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  addSelected: (type: "path" | "shape" | "text", id: string) => void;
  clearSelection: () => void;
  setIsDragSelecting: (isDragSelecting: boolean) => void;
  setDragStartPoint: (point: Point | null) => void;
  setDragEndPoint: (point: Point | null) => void;
  resizeSelected: (arg: ResizeSelected) => void;
  moveSelected: (type: "path" | "shape" | "text", offset: Point) => void;
};

export const useCanvasStore = (): CanvasStore => {
  const pathStore = usePathStore();
  const shapeStore = useShapeStore();
  const textStore = useTextStore();
  const eraserStore = useEraserStore();
  const selectionStore = useSelectionStore();
  const resizeStore = useResizeStore();
  const moveStore = useMoveStore();
  const viewportStore = useViewportStore();

  return {
    // 상태
    paths: pathStore.paths,
    shapes: shapeStore.shapes,
    texts: textStore.texts,
    currentPaths: pathStore.currentPaths,
    currentShapes: shapeStore.currentShapes,
    currentTexts: textStore.currentTexts,
    pathsToErase: eraserStore.pathsToErase,
    shapesToErase: eraserStore.shapesToErase,
    textsToErase: eraserStore.textsToErase,
    selectedPaths: selectionStore.selectedPaths,
    selectedShapes: selectionStore.selectedShapes,
    selectedTexts: selectionStore.selectedTexts,
    isDragSelecting: selectionStore.isDragSelecting,
    dragStartPoint: selectionStore.dragStartPoint,
    dragEndPoint: selectionStore.dragEndPoint,
    zoom: viewportStore.zoom,
    pan: viewportStore.pan,

    // 경로 관리
    setPaths: pathStore.setPaths,

    // 도형 관리
    setShapes: shapeStore.setShapes,

    // 텍스트 관리
    setTexts: textStore.setTexts,

    // 지우개 관리
    addToErase: eraserStore.addToErase,
    clearToErase: eraserStore.clearToErase,

    // 선택 관리
    addSelected: selectionStore.addSelected,
    clearSelection: selectionStore.clearSelection,

    // 드래그 관리
    setIsDragSelecting: selectionStore.setIsDragSelecting,
    setDragStartPoint: selectionStore.setDragStartPoint,
    setDragEndPoint: selectionStore.setDragEndPoint,

    // 뷰포트 관리
    setZoom: viewportStore.setZoom,
    setPan: viewportStore.setPan,

    // 리사이즈 관리
    resizeSelected: resizeStore.resizeSelected,

    // 이동 관리
    moveSelected: moveStore.moveSelected,
  };
};
