import { create } from "zustand";
import type { Point, Path, Shape, BoundingBox } from "../types";
import { calculateBoundingBox } from "../utils/geometry.utils";

interface CanvasStore {
  paths: Path[];
  currentPath: Path | null;
  shapes: Shape[];
  currentShape: Shape | null;
  pathsToErase: string[];
  shapesToErase: string[];
  zoom: number;
  pan: Point;

  setPaths: (paths: Path[]) => void;
  addPath: (path: Path) => void;
  removePaths: (ids: string[]) => void;

  setCurrentPath: (path: Path | null) => void;
  addCurrentPathPoint: (point: Point) => void;

  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  removeShapes: (ids: string[]) => void;

  setCurrentShape: (shape: Shape | null) => void;
  updateCurrentShape: (endPoint: Point) => void;

  clearPathsToErase: () => void;
  addPathToErase: (id: string) => void;

  clearShapesToErase: () => void;
  addShapeToErase: (id: string) => void;

  selectedPathIds: string[];
  selectedShapeIds: string[];
  setSelectedPathIds: (ids: string[]) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  clearSelection: () => void;

  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;

  resizeSelectedPaths: (newBoundingBox: BoundingBox) => void;
  resizeSelectedShapes: (newBoundingBox: BoundingBox) => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  paths: [],
  currentPath: null,
  shapes: [],
  currentShape: null,
  pathsToErase: [],
  shapesToErase: [],
  selectedPathIds: [],
  selectedShapeIds: [],
  zoom: 1,
  pan: { x: 0, y: 0 },

  setPaths: (paths) => set({ paths }),
  addPath: (path) => set((state) => ({ paths: [...state.paths, path] })),
  removePaths: (ids) =>
    set((state) => ({ paths: state.paths.filter((v) => !ids.includes(v.id)) })),

  setCurrentPath: (currentPath) => set({ currentPath }),
  addCurrentPathPoint: (point) =>
    set((state) => {
      if (!state.currentPath) return state;

      return {
        currentPath: {
          ...state.currentPath,
          points: [...state.currentPath.points, point],
        },
      };
    }),

  setShapes: (shapes) => set({ shapes }),
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  removeShapes: (ids) =>
    set((state) => ({
      shapes: state.shapes.filter((v) => !ids.includes(v.id)),
    })),

  setCurrentShape: (currentShape) => set({ currentShape }),
  updateCurrentShape: (endPoint) =>
    set((state) => {
      if (!state.currentShape) return state;

      return {
        currentShape: {
          ...state.currentShape,
          endPoint,
        },
      };
    }),

  clearPathsToErase: () => set({ pathsToErase: [] }),
  addPathToErase: (id) =>
    set((state) => ({ pathsToErase: [...state.pathsToErase, id] })),

  clearShapesToErase: () => set({ shapesToErase: [] }),
  addShapeToErase: (id) =>
    set((state) => ({ shapesToErase: [...state.shapesToErase, id] })),

  setSelectedPathIds: (ids) => set({ selectedPathIds: ids }),
  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),
  clearSelection: () => set({ selectedPathIds: [], selectedShapeIds: [] }),

  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set({ pan }),

  resizeSelectedPaths: (newBoundingBox) =>
    set((state) => {
      if (state.selectedPathIds.length === 0) return state;

      const updatedPaths = state.paths.map((path) => {
        if (!state.selectedPathIds.includes(path.id)) return path;

        const oldBox = path.boundingBox;
        const oldWidth = oldBox.topRight.x - oldBox.topLeft.x;
        const oldHeight = oldBox.bottomLeft.y - oldBox.topLeft.y;
        const newWidth = newBoundingBox.topRight.x - newBoundingBox.topLeft.x;
        const newHeight =
          newBoundingBox.bottomLeft.y - newBoundingBox.topLeft.y;

        // 스케일 비율 계산 (0으로 나누기 방지)
        const scaleX = oldWidth !== 0 ? newWidth / oldWidth : 1;
        const scaleY = oldHeight !== 0 ? newHeight / oldHeight : 1;

        // 원점 이동 계산
        const offsetX = newBoundingBox.topLeft.x - oldBox.topLeft.x;
        const offsetY = newBoundingBox.topLeft.y - oldBox.topLeft.y;

        // 모든 포인트를 스케일링하고 이동
        const scaledPoints = path.points.map((point) => ({
          x: (point.x - oldBox.topLeft.x) * scaleX + oldBox.topLeft.x + offsetX,
          y: (point.y - oldBox.topLeft.y) * scaleY + oldBox.topLeft.y + offsetY,
        }));

        return {
          ...path,
          points: scaledPoints,
          boundingBox: calculateBoundingBox(scaledPoints),
        };
      });

      return { paths: updatedPaths };
    }),

  resizeSelectedShapes: (newBoundingBox) =>
    set((state) => {
      if (state.selectedShapeIds.length === 0) return state;

      const updatedShapes = state.shapes.map((shape) => {
        if (!state.selectedShapeIds.includes(shape.id)) return shape;

        const oldBox = shape.boundingBox;
        const oldWidth = oldBox.topRight.x - oldBox.topLeft.x;
        const oldHeight = oldBox.bottomLeft.y - oldBox.topLeft.y;
        const newWidth = newBoundingBox.topRight.x - newBoundingBox.topLeft.x;
        const newHeight =
          newBoundingBox.bottomLeft.y - newBoundingBox.topLeft.y;

        // 스케일 비율 계산 (0으로 나누기 방지)
        const scaleX = oldWidth !== 0 ? newWidth / oldWidth : 1;
        const scaleY = oldHeight !== 0 ? newHeight / oldHeight : 1;

        // 원점 이동 계산
        const offsetX = newBoundingBox.topLeft.x - oldBox.topLeft.x;
        const offsetY = newBoundingBox.topLeft.y - oldBox.topLeft.y;

        // startPoint와 endPoint를 스케일링하고 이동
        const newStartPoint = {
          x:
            (shape.startPoint.x - oldBox.topLeft.x) * scaleX +
            oldBox.topLeft.x +
            offsetX,
          y:
            (shape.startPoint.y - oldBox.topLeft.y) * scaleY +
            oldBox.topLeft.y +
            offsetY,
        };

        const newEndPoint = {
          x:
            (shape.endPoint.x - oldBox.topLeft.x) * scaleX +
            oldBox.topLeft.x +
            offsetX,
          y:
            (shape.endPoint.y - oldBox.topLeft.y) * scaleY +
            oldBox.topLeft.y +
            offsetY,
        };

        const minX = Math.min(newStartPoint.x, newEndPoint.x);
        const maxX = Math.max(newStartPoint.x, newEndPoint.x);
        const minY = Math.min(newStartPoint.y, newEndPoint.y);
        const maxY = Math.max(newStartPoint.y, newEndPoint.y);

        return {
          ...shape,
          startPoint: newStartPoint,
          endPoint: newEndPoint,
          boundingBox: {
            topLeft: { x: minX, y: minY },
            topRight: { x: maxX, y: minY },
            bottomLeft: { x: minX, y: maxY },
            bottomRight: { x: maxX, y: maxY },
          },
        };
      });

      return { shapes: updatedShapes };
    }),
}));
