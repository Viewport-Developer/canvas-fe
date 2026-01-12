import type { Point, BoundingBox } from "./common.types";

// 도형 관련 타입

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

// 도형 생성 액션
export type ShapeAction = {
  type: "shape";
  shape: Shape;
};
