import type { Point, BoundingBox } from "./common.types";

// 경로 관련 타입

// 자유 곡선 경로
export type Path = {
  id: string;
  points: Point[];
  color: string;
  width: number;
  boundingBox: BoundingBox;
};

// 그리기 액션
export type DrawAction = {
  type: "draw";
  path: Path;
};
