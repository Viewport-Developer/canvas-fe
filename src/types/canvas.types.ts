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
