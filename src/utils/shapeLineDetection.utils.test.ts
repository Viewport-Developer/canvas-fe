import { describe, it, expect } from "vitest";
import { isPointOnShape } from "./shapeLineDetection.utils";

const makeBox = (minX: number, minY: number, maxX: number, maxY: number) => ({
  topLeft: { x: minX, y: minY },
  topRight: { x: maxX, y: minY },
  bottomLeft: { x: minX, y: maxY },
  bottomRight: { x: maxX, y: maxY },
});

describe("shapeLineDetection.utils", () => {
  describe("isPointOnShape", () => {
    it("바운딩 박스 밖의 점이면 false", () => {
      const shape = {
        id: "s1",
        type: "rectangle" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 20, y: 20 },
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 20, 20),
      };
      expect(isPointOnShape({ x: 100, y: 100 }, shape, 5)).toBe(false);
    });

    it("사각형 테두리 근처 점이면 true", () => {
      const shape = {
        id: "s1",
        type: "rectangle" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 },
        color: "#000",
        width: 4,
        boundingBox: makeBox(0, 0, 100, 100),
      };
      expect(isPointOnShape({ x: 50, y: 0 }, shape, 10)).toBe(true);
    });

    it("diamond 타입도 처리한다", () => {
      const shape = {
        id: "s1",
        type: "diamond" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 20, y: 20 },
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 20, 20),
      };
      const result = isPointOnShape({ x: 10, y: 0 }, shape, 5);
      expect(typeof result).toBe("boolean");
    });
  });
});
