import type { Point, BoundingBox } from "./common.types";

// 도형 타입
export type ShapeType = "rectangle" | "diamond" | "circle";

// 도형
export type Shape = {
  id: string;
  type: ShapeType;
  startPoint: Point;
  endPoint: Point;
  color: string;
  width: number;
  boundingBox: BoundingBox;
};
