import { create } from "zustand";
import type { Point, Shape } from "../types";
import { getGlobalYjsData, getGlobalClientId, type CurrentShape } from "./yjsStore";

interface ShapeStore {
  shapes: Shape[];
  currentShape: Shape | null;

  setShapes: (shapes: Shape[], skipYjsSync?: boolean) => void;
  addShape: (shape: Shape) => void;
  removeShapes: (ids: string[]) => void;
  setCurrentShape: (shape: Shape | null) => void;
  updateCurrentShape: (endPoint: Point) => void;
}

// y.js에 쓰기 헬퍼 함수
const syncToYjs = (shapes: Shape[]) => {
  const yjsData = getGlobalYjsData();
  if (yjsData?.shapes) {
    const yjsArray = yjsData.shapes.toArray();
    if (JSON.stringify(yjsArray) !== JSON.stringify(shapes)) {
      yjsData.shapes.delete(0, yjsData.shapes.length);
      yjsData.shapes.insert(0, shapes);
    }
  }
};

export const useShapeStore = create<ShapeStore>((set) => ({
  shapes: [],
  currentShape: null,

  setShapes: (shapes, skipYjsSync = false) => {
    set({ shapes });
    if (!skipYjsSync) {
      syncToYjs(shapes);
    }
  },

  addShape: (shape) =>
    set((state) => {
      const newShapes = [...state.shapes, shape];
      syncToYjs(newShapes);
      return { shapes: newShapes };
    }),

  removeShapes: (ids) =>
    set((state) => {
      const newShapes = state.shapes.filter((shape) => !ids.includes(shape.id));
      syncToYjs(newShapes);
      return { shapes: newShapes };
    }),

  setCurrentShape: (currentShape) => {
    const yjsData = getGlobalYjsData();
    const clientId = getGlobalClientId();
    
    if (yjsData?.currentShapes && clientId !== null) {
      // 기존 currentShape 제거
      const currentShapes = yjsData.currentShapes.toArray();
      const existingIndex = currentShapes.findIndex((cs) => cs.clientId === clientId);
      if (existingIndex !== -1) {
        yjsData.currentShapes.delete(existingIndex, 1);
      }
      
      // 새 currentShape 추가
      if (currentShape) {
        yjsData.currentShapes.push([{ clientId, shape: currentShape }]);
      }
    }
    
    set({ currentShape });
  },

  updateCurrentShape: (endPoint) =>
    set((state) => {
      if (!state.currentShape) return state;
      
      const updatedShape = {
        ...state.currentShape,
        endPoint,
      };
      
      // y.js에 실시간 동기화
      const yjsData = getGlobalYjsData();
      const clientId = getGlobalClientId();
      
      if (yjsData?.currentShapes && clientId !== null) {
        const currentShapes = yjsData.currentShapes.toArray();
        const existingIndex = currentShapes.findIndex((cs) => cs.clientId === clientId);
        
        if (existingIndex !== -1) {
          // 기존 항목 업데이트
          yjsData.currentShapes.delete(existingIndex, 1);
          yjsData.currentShapes.insert(existingIndex, [{ clientId, shape: updatedShape }]);
        } else {
          // 새로 추가
          yjsData.currentShapes.push([{ clientId, shape: updatedShape }]);
        }
      }
      
      return { currentShape: updatedShape };
    }),
}));
