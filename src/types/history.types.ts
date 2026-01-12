import type { Path } from "./path.types";
import type { Shape } from "./shape.types";
import type { Point } from "./common.types";

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
