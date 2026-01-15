// 캔버스 스토어 통합
// 하위 호환성을 위해 모든 스토어를 통합하여 제공합니다.

import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import { useSelectionStore } from "./selectionStore";
import { useViewportStore } from "./viewportStore";
import { useEraserStore } from "./eraserStore";
import { useResizeStore } from "./resizeStore";
import { useMoveStore } from "./moveStore";
import type { Point, Path, Shape, Text, BoundingBox, ResizeHandleType } from "../types";

interface CanvasStore {
  // ========== 상태 ==========

  // 완성된 경로 목록
  paths: Path[];
  // 현재 그리는 중인 경로
  currentPath: Path | null;

  // 완성된 도형 목록
  shapes: Shape[];
  // 현재 그리는 중인 도형
  currentShape: Shape | null;

  // 완성된 텍스트 목록
  texts: Text[];

  // 지울 경로 ID 목록
  pathsToErase: string[];
  // 지울 도형 ID 목록
  shapesToErase: string[];
  // 지울 텍스트 ID 목록
  textsToErase: string[];

  // 선택된 경로 ID 목록
  selectedPathIds: string[];
  // 선택된 도형 ID 목록
  selectedShapeIds: string[];
  // 선택된 텍스트 ID 목록
  selectedTextIds: string[];

  // 드래그 선택 상태
  isDragSelecting: boolean;
  dragStartPoint: Point | null;
  dragEndPoint: Point | null;

  // 줌 레벨
  zoom: number;
  // 팬(이동) 오프셋
  pan: Point;

  // ========== 경로 관리 ==========

  setPaths: (paths: Path[]) => void;
  addPath: (path: Path) => void;
  removePaths: (ids: string[]) => void;
  setCurrentPath: (path: Path | null) => void;
  addCurrentPathPoint: (point: Point) => void;

  // ========== 도형 관리 ==========

  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  removeShapes: (ids: string[]) => void;
  setCurrentShape: (shape: Shape | null) => void;
  updateCurrentShape: (endPoint: Point) => void;

  // ========== 텍스트 관리 ==========

  setTexts: (texts: Text[]) => void;
  addText: (text: Text) => void;
  removeTexts: (ids: string[]) => void;
  updateText: (id: string, content: string) => void;
  updateTextWithBoundingBox: (id: string, content: string, boundingBox: Text["boundingBox"]) => void;

  // ========== 지우개 관리 ==========

  clearPathsToErase: () => void;
  addPathToErase: (id: string) => void;
  clearShapesToErase: () => void;
  addShapeToErase: (id: string) => void;
  clearTextsToErase: () => void;
  addTextToErase: (id: string) => void;

  // ========== 선택 관리 ==========

  setSelectedPathIds: (ids: string[]) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  setSelectedTextIds: (ids: string[]) => void;
  addSelectedPathId: (id: string) => void;
  addSelectedShapeId: (id: string) => void;
  addSelectedTextId: (id: string) => void;
  clearSelection: () => void;

  // 드래그 선택 상태 관리
  setIsDragSelecting: (isDragSelecting: boolean) => void;
  setDragStartPoint: (point: Point | null) => void;
  setDragEndPoint: (point: Point | null) => void;

  // ========== 뷰포트 관리 ==========

  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;

  // ========== 리사이즈 관리 ==========

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

  // ========== 이동 관리 ==========

  moveSelectedPaths: (offset: Point) => void;
  moveSelectedShapes: (offset: Point) => void;
  moveSelectedTexts: (offset: Point) => void;
}

export const useCanvasStore = (): CanvasStore => {
  const pathStore = usePathStore();
  const shapeStore = useShapeStore();
  const textStore = useTextStore();
  const selectionStore = useSelectionStore();
  const viewportStore = useViewportStore();
  const eraserStore = useEraserStore();
  const resizeStore = useResizeStore();
  const moveStore = useMoveStore();

  return {
    // 상태
    paths: pathStore.paths,
    currentPath: pathStore.currentPath,
    shapes: shapeStore.shapes,
    currentShape: shapeStore.currentShape,
    texts: textStore.texts,
    pathsToErase: eraserStore.pathsToErase,
    shapesToErase: eraserStore.shapesToErase,
    textsToErase: eraserStore.textsToErase,
    selectedPathIds: selectionStore.selectedPathIds,
    selectedShapeIds: selectionStore.selectedShapeIds,
    selectedTextIds: selectionStore.selectedTextIds,
    isDragSelecting: selectionStore.isDragSelecting,
    dragStartPoint: selectionStore.dragStartPoint,
    dragEndPoint: selectionStore.dragEndPoint,
    zoom: viewportStore.zoom,
    pan: viewportStore.pan,

    // 경로 관리
    setPaths: pathStore.setPaths,
    addPath: pathStore.addPath,
    removePaths: pathStore.removePaths,
    setCurrentPath: pathStore.setCurrentPath,
    addCurrentPathPoint: pathStore.addCurrentPathPoint,

    // 도형 관리
    setShapes: shapeStore.setShapes,
    addShape: shapeStore.addShape,
    removeShapes: shapeStore.removeShapes,
    setCurrentShape: shapeStore.setCurrentShape,
    updateCurrentShape: shapeStore.updateCurrentShape,

    // 텍스트 관리
    setTexts: textStore.setTexts,
    addText: textStore.addText,
    removeTexts: textStore.removeTexts,
    updateText: textStore.updateText,
    updateTextWithBoundingBox: textStore.updateTextWithBoundingBox,

    // 지우개 관리
    clearPathsToErase: eraserStore.clearPathsToErase,
    addPathToErase: eraserStore.addPathToErase,
    clearShapesToErase: eraserStore.clearShapesToErase,
    addShapeToErase: eraserStore.addShapeToErase,
    clearTextsToErase: eraserStore.clearTextsToErase,
    addTextToErase: eraserStore.addTextToErase,

    // 선택 관리
    setSelectedPathIds: selectionStore.setSelectedPathIds,
    setSelectedShapeIds: selectionStore.setSelectedShapeIds,
    setSelectedTextIds: selectionStore.setSelectedTextIds,
    addSelectedPathId: selectionStore.addSelectedPathId,
    addSelectedShapeId: selectionStore.addSelectedShapeId,
    addSelectedTextId: selectionStore.addSelectedTextId,
    clearSelection: selectionStore.clearSelection,

    // 드래그 선택 상태 관리
    setIsDragSelecting: selectionStore.setIsDragSelecting,
    setDragStartPoint: selectionStore.setDragStartPoint,
    setDragEndPoint: selectionStore.setDragEndPoint,

    // 뷰포트 관리
    setZoom: viewportStore.setZoom,
    setPan: viewportStore.setPan,

    // 리사이즈 관리
    resizeSelectedPaths: resizeStore.resizeSelectedPaths,
    resizeSelectedShapes: resizeStore.resizeSelectedShapes,
    resizeSelectedTexts: resizeStore.resizeSelectedTexts,

    // 이동 관리
    moveSelectedPaths: moveStore.moveSelectedPaths,
    moveSelectedShapes: moveStore.moveSelectedShapes,
    moveSelectedTexts: moveStore.moveSelectedTexts,
  };
};
