import * as Y from "yjs";
import type { Path, Shape, Text } from "../types";

// 현재 그리는 중인 경로 (clientId와 함께 저장)
export interface CurrentPath {
  clientId: number;
  path: Path;
}

// 현재 그리는 중인 도형 (clientId와 함께 저장)
export interface CurrentShape {
  clientId: number;
  shape: Shape;
}

// Y.js 문서 타입 정의
export interface YjsCanvasData {
  paths: Y.Array<Path>;
  shapes: Y.Array<Shape>;
  texts: Y.Array<Text>;
  currentPaths: Y.Array<CurrentPath>;
  currentShapes: Y.Array<CurrentShape>;
}

// 전역 y.js 데이터 참조 (스토어에서 접근 가능하도록)
let globalYjsData: YjsCanvasData | null = null;
// 전역 clientId 참조
let globalClientId: number | null = null;

// Y.js 문서 인스턴스 생성
export const createYjsDoc = (): Y.Doc => {
  const doc = new Y.Doc();

  // Y.Array 초기화
  doc.getArray<Path>("paths");
  doc.getArray<Shape>("shapes");
  doc.getArray<Text>("texts");
  doc.getArray<CurrentPath>("currentPaths");
  doc.getArray<CurrentShape>("currentShapes");

  return doc;
};

// Y.js 문서에서 데이터 추출 및 전역 참조 설정
export const getYjsData = (doc: Y.Doc): YjsCanvasData => {
  const data = {
    paths: doc.getArray<Path>("paths"),
    shapes: doc.getArray<Shape>("shapes"),
    texts: doc.getArray<Text>("texts"),
    currentPaths: doc.getArray<CurrentPath>("currentPaths"),
    currentShapes: doc.getArray<CurrentShape>("currentShapes"),
  };
  globalYjsData = data;
  return data;
};

// 전역 y.js 데이터 참조 가져오기
export const getGlobalYjsData = (): YjsCanvasData | null => {
  return globalYjsData;
};

// clientId 설정
export const setGlobalClientId = (clientId: number): void => {
  globalClientId = clientId;
};

// clientId 가져오기
export const getGlobalClientId = (): number | null => {
  return globalClientId;
};
