import { describe, it, expect } from "vitest";
import { calculateDistance, isInEraserRange } from "./distance.utils";

describe("distance.utils", () => {
  describe("calculateDistance", () => {
    it("두 점 사이 거리를 올바르게 계산한다", () => {
      expect(calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(calculateDistance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
      expect(calculateDistance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
    });
  });

  describe("isInEraserRange", () => {
    it("반경 안에 있으면 true를 반환한다", () => {
      expect(isInEraserRange({ x: 5, y: 5 }, { x: 5, y: 5 }, 10)).toBe(true);
      expect(isInEraserRange({ x: 10, y: 10 }, { x: 10, y: 10 }, 5)).toBe(true);
    });

    it("반경 밖에 있으면 false를 반환한다", () => {
      expect(isInEraserRange({ x: 0, y: 0 }, { x: 10, y: 10 }, 5)).toBe(false);
    });
  });
});
