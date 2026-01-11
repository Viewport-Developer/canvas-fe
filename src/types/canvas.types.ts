export type Point = {
  x: number;
  y: number;
};

export type Path = {
  id: string;
  points: Point[];
  color: string;
  width: number;
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
