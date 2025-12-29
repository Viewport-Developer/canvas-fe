export type Point = {
  x: number;
  y: number;
};

export type Path = {
  id: string;
  points: Point[];
  stroke: string;
  strokeWidth: number;
};

export type CanvasState = {
  zoom: number;
  pan: Point;
};
