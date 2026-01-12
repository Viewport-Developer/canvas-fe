import type { Path } from "./path.types";
import type { Shape } from "./shape.types";
import type { Point, BoundingBox } from "./common.types";

// 히스토리 관련 타입

// 지우기 액션
export type EraseAction = {
  type: "erase";
  paths: Path[];
  shapes: Shape[];
};

// 팬(이동) 액션
export type PanAction = {
  type: "pan";
  previousPan: Point;
  newPan: Point;
};

// 리사이즈 액션
export type ResizeAction = {
  type: "resize";
  // 리사이즈 전 상태
  previousPaths: Path[];
  previousShapes: Shape[];
  previousBoundingBox: BoundingBox;
  // 리사이즈 후 상태
  newPaths: Path[];
  newShapes: Shape[];
  newBoundingBox: BoundingBox;
};
