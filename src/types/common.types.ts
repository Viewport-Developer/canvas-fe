// 2D 좌표점
export type Point = {
  x: number;
  y: number;
};

// 바운딩 박스 (도형의 경계 영역)
export type BoundingBox = {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
};

// 리사이즈 핸들 타입
export type ResizeHandleType =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "top"
  | "bottom"
  | "left"
  | "right";
