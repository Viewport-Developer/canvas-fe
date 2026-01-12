import type { Point, BoundingBox } from "./common.types";

// 자유 곡선 경로
export type Path = {
  id: string;
  points: Point[];
  color: string;
  width: number;
  boundingBox: BoundingBox;
};
