import { describe, it, expect } from "vitest";
import { getControlPoints, expandPoints } from "./pathCurve.utils";

describe("pathCurve.utils", () => {
  describe("getControlPoints", () => {
    it("3점과 tension으로 베지어 제어점 4개를 반환한다", () => {
      const [p1x, p1y, p2x, p2y] = getControlPoints(0, 0, 10, 10, 20, 0, 0.5);
      expect([p1x, p1y, p2x, p2y]).toHaveLength(4);
      expect(typeof p1x).toBe("number");
      expect(typeof p2x).toBe("number");
    });

    it("같은 점이 연속되면 NaN이 나올 수 있다", () => {
      const cp = getControlPoints(0, 0, 0, 0, 0, 0, 0.5);
      expect(cp.every((n) => typeof n === "number")).toBe(true);
    });
  });

  describe("expandPoints", () => {
    it("점이 6개 미만이면 빈 배열을 반환한다", () => {
      expect(expandPoints([0, 0, 10, 10], 0.5)).toEqual([]);
    });

    it("점이 6개 이상이면 제어점 배열을 반환한다", () => {
      const p = [0, 0, 10, 10, 20, 10, 30, 0];
      const out = expandPoints(p, 0.5);
      expect(Array.isArray(out)).toBe(true);
      expect(out.length % 6).toBe(0);
    });
  });
});
