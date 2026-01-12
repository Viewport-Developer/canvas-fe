export type Point = {
  x: number;
  y: number;
};

export type BoundingBox = {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
};

export type Path = {
  id: string;
  points: Point[];
  color: string;
  width: number;
  boundingBox: BoundingBox;
};

export type DrawAction = {
  type: "draw";
  path: Path;
};

export type EraseAction = {
  type: "erase";
  paths: Path[];
  shapes: Shape[];
};

export type PanAction = {
  type: "pan";
  previousPan: Point;
  newPan: Point;
};

export type ShapeType = "rectangle" | "diamond" | "circle";

export type Shape = {
  id: string;
  type: ShapeType;
  startPoint: Point;
  endPoint: Point;
  color: string;
  width: number;
  boundingBox: BoundingBox;
};

export type ShapeAction = {
  type: "shape";
  shape: Shape;
};

export type HistoryAction = DrawAction | EraseAction | PanAction | ShapeAction;

export type ResizeHandleType =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "top"
  | "bottom"
  | "left"
  | "right";
