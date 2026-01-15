import type { Point, BoundingBox } from "./common.types";

// 텍스트 요소
export type Text = {
  id: string;
  position: Point;
  content: string;
  color: string;
  fontSize: number;
  boundingBox: BoundingBox;
};
