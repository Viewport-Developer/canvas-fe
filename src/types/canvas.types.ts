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
};

export type PanAction = {
  type: "pan";
  previousPan: Point;
  newPan: Point;
};

export type HistoryAction = DrawAction | EraseAction | PanAction;
