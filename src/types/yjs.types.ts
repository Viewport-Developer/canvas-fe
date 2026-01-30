import * as Y from "yjs";
import type { Path, Shape, Text } from "./index";

// Y.js 문서의 캔버스 데이터 구조
export type YjsCanvasData = {
  paths: Y.Array<Path>;
  shapes: Y.Array<Shape>;
  texts: Y.Array<Text>;
};

// 원격 사용자의 커서 정보 (Y.js Awareness API를 통해 실시간 추적)
export type RemoteCursor = {
  position: { x: number; y: number } | null;
  color: string;
};

export type AwarenessLike = {
  setLocalStateField: (field: string, value: unknown) => void;
  getLocalState: () => AwarenessState | null;
  getStates: () => Map<number, AwarenessState | null>;
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
};

export type AwarenessState = {
  cursor?: { x: number; y: number } | null;
  currentPath?: Path | null;
  currentShape?: Shape | null;
  currentText?: Text | null;
};
