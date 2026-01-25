import * as Y from "yjs";
import type { Path, Shape, Text } from "../types";

// Y.js 문서 타입 정의
export interface YjsCanvasData {
  paths: Y.Array<Path>;
  shapes: Y.Array<Shape>;
  texts: Y.Array<Text>;
}

// 전역 y.js 데이터 참조 (스토어에서 접근 가능하도록)
let globalYjsData: YjsCanvasData | null = null;

// Y.js 문서 인스턴스 생성
export const createYjsDoc = (): Y.Doc => {
  const doc = new Y.Doc();

  // Y.Array 초기화
  doc.getArray<Path>("paths");
  doc.getArray<Shape>("shapes");
  doc.getArray<Text>("texts");

  return doc;
};

// Y.js 문서에서 데이터 추출 및 전역 참조 설정
export const getYjsData = (doc: Y.Doc): YjsCanvasData => {
  const data = {
    paths: doc.getArray<Path>("paths"),
    shapes: doc.getArray<Shape>("shapes"),
    texts: doc.getArray<Text>("texts"),
  };
  globalYjsData = data;
  return data;
};

// 전역 y.js 데이터 참조 가져오기
export const getGlobalYjsData = (): YjsCanvasData | null => {
  return globalYjsData;
};
