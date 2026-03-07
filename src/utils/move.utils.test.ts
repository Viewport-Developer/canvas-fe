import { describe, it, expect } from "vitest";
import { movePath, moveShape, moveText } from "./move.utils";

const makeBox = (minX: number, minY: number, maxX: number, maxY: number) => ({
  topLeft: { x: minX, y: minY },
  topRight: { x: maxX, y: minY },
  bottomLeft: { x: minX, y: maxY },
  bottomRight: { x: maxX, y: maxY },
});

describe("move.utils", () => {
  describe("movePath", () => {
    it("경로의 모든 점을 오프셋만큼 이동한다", () => {
      const path = {
        id: "p1",
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 10, 10),
      };
      const moved = movePath(path, { x: 5, y: -3 });
      expect(moved.points[0]).toEqual({ x: 5, y: -3 });
      expect(moved.points[1]).toEqual({ x: 15, y: 7 });
      expect(moved.boundingBox.topLeft).toEqual({ x: 5, y: -3 });
      expect(moved.boundingBox.bottomRight).toEqual({ x: 15, y: 7 });
    });
  });

  describe("moveShape", () => {
    it("도형의 startPoint, endPoint를 오프셋만큼 이동한다", () => {
      const shape = {
        id: "s1",
        type: "rectangle" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 20, y: 10 },
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 20, 10),
      };
      const moved = moveShape(shape, { x: 10, y: 5 });
      expect(moved.startPoint).toEqual({ x: 10, y: 5 });
      expect(moved.endPoint).toEqual({ x: 30, y: 15 });
      expect(moved.boundingBox.topLeft).toEqual({ x: 10, y: 5 });
      expect(moved.boundingBox.bottomRight).toEqual({ x: 30, y: 15 });
    });
  });

  describe("moveText", () => {
    it("텍스트 position을 오프셋만큼 이동하고 바운딩 박스를 갱신한다", () => {
      const text = {
        id: "t1",
        position: { x: 0, y: 0 },
        content: "",
        color: "#000",
        fontSize: 16,
        boundingBox: makeBox(0, 0, 0, 16),
      };
      const moved = moveText(text, { x: 10, y: 20 });
      expect(moved.position).toEqual({ x: 10, y: 20 });
      expect(moved.boundingBox.topLeft).toEqual({ x: 10, y: 20 });
    });
  });
});
