import { describe, it, expect } from "vitest";
import {
  calculateBoundingBox,
  isPointInBoundingBox,
  calculateBoundingBoxSize,
  getCombinedBoundingBox,
  doBoundingBoxesIntersect,
  calculateTextBoundingBox,
} from "./boundingBox.utils";

const makeBox = (minX: number, minY: number, maxX: number, maxY: number) => ({
  topLeft: { x: minX, y: minY },
  topRight: { x: maxX, y: minY },
  bottomLeft: { x: minX, y: maxY },
  bottomRight: { x: maxX, y: maxY },
});

describe("boundingBox.utils", () => {
  describe("calculateBoundingBox", () => {
    it("포인트 배열로 바운딩 박스를 계산한다", () => {
      const points = [{ x: 0, y: 0 }, { x: 10, y: 5 }, { x: 3, y: 20 }];
      const box = calculateBoundingBox(points);
      expect(box.topLeft).toEqual({ x: 0, y: 0 });
      expect(box.topRight).toEqual({ x: 10, y: 0 });
      expect(box.bottomLeft).toEqual({ x: 0, y: 20 });
      expect(box.bottomRight).toEqual({ x: 10, y: 20 });
    });

    it("포인트가 하나일 때도 동작한다", () => {
      const box = calculateBoundingBox([{ x: 5, y: 5 }]);
      expect(box.topLeft).toEqual({ x: 5, y: 5 });
      expect(box.bottomRight).toEqual({ x: 5, y: 5 });
    });
  });

  describe("isPointInBoundingBox", () => {
    it("박스 안의 점이면 true", () => {
      const box = makeBox(0, 0, 10, 10);
      expect(isPointInBoundingBox({ x: 5, y: 5 }, box)).toBe(true);
      expect(isPointInBoundingBox({ x: 0, y: 0 }, box)).toBe(true);
      expect(isPointInBoundingBox({ x: 10, y: 10 }, box)).toBe(true);
    });

    it("박스 밖의 점이면 false", () => {
      const box = makeBox(0, 0, 10, 10);
      expect(isPointInBoundingBox({ x: 11, y: 5 }, box)).toBe(false);
      expect(isPointInBoundingBox({ x: -1, y: 5 }, box)).toBe(false);
    });
  });

  describe("calculateBoundingBoxSize", () => {
    it("너비와 높이를 계산한다", () => {
      const box = makeBox(0, 0, 20, 10);
      expect(calculateBoundingBoxSize(box)).toEqual({ width: 20, height: 10 });
    });
  });

  describe("getCombinedBoundingBox", () => {
    it("빈 배열이면 null", () => {
      expect(getCombinedBoundingBox([], [], [])).toBe(null);
    });

    it("path 하나로 결합 박스를 만든다", () => {
      const path = {
        id: "p1",
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 10, 10),
      };
      const box = getCombinedBoundingBox([path], [], []);
      expect(box).toEqual(makeBox(0, 0, 10, 10));
    });

    it("여러 path/shape/text의 결합 박스를 만든다", () => {
      const path = {
        id: "p1",
        points: [],
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 5, 5),
      };
      const shape = {
        id: "s1",
        type: "rectangle" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 0 },
        color: "#000",
        width: 2,
        boundingBox: makeBox(10, 10, 20, 20),
      };
      const box = getCombinedBoundingBox([path], [shape], []);
      expect(box?.topLeft).toEqual({ x: 0, y: 0 });
      expect(box?.bottomRight).toEqual({ x: 20, y: 20 });
    });
  });

  describe("doBoundingBoxesIntersect", () => {
    it("겹치면 true", () => {
      const a = makeBox(0, 0, 10, 10);
      const b = makeBox(5, 5, 15, 15);
      expect(doBoundingBoxesIntersect(a, b)).toBe(true);
    });

    it("안 겹치면 false", () => {
      const a = makeBox(0, 0, 10, 10);
      const b = makeBox(20, 20, 30, 30);
      expect(doBoundingBoxesIntersect(a, b)).toBe(false);
    });
  });

  describe("calculateTextBoundingBox", () => {
    it("빈 content일 때 위치 기준 박스를 반환한다", () => {
      const box = calculateTextBoundingBox("", { x: 10, y: 20 }, 16);
      expect(box.topLeft).toEqual({ x: 10, y: 20 });
      expect(box.bottomRight).toEqual({ x: 10, y: 20 + 16 });
    });
  });
});
