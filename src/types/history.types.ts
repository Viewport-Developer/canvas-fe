import type { Path } from "./path.types";
import type { Shape } from "./shape.types";
import type { Text } from "./text.types";
import type { Point, BoundingBox } from "./common.types";

// 그리기 액션
export type DrawAction = {
  type: "draw";
  path: Path;
};

// 도형 생성 액션
export type ShapeAction = {
  type: "shape";
  shape: Shape;
};

// 텍스트 액션
export type TextAction = {
  type: "text";
  previousText: Text | null;
  newText: Text;
};

// 지우기 액션
export type EraseAction = {
  type: "erase";
  paths: Path[];
  shapes: Shape[];
  texts: Text[];
};

// 팬 액션
export type PanAction = {
  type: "pan";
  previousPan: Point;
  newPan: Point;
};

// 리사이즈 액션
export type ResizeAction = {
  type: "resize";
  previousPaths: Path[];
  previousShapes: Shape[];
  previousTexts: Text[];
  previousBoundingBox: BoundingBox;
  newPaths: Path[];
  newShapes: Shape[];
  newTexts: Text[];
  newBoundingBox: BoundingBox;
};

// 이동 액션
export type MoveAction = {
  type: "move";
  previousPaths: Path[];
  previousShapes: Shape[];
  previousTexts: Text[];
  newPaths: Path[];
  newShapes: Shape[];
  newTexts: Text[];
};

// 모든 히스토리 액션의 유니온 타입
export type HistoryAction = DrawAction | EraseAction | PanAction | ShapeAction | ResizeAction | MoveAction | TextAction;
