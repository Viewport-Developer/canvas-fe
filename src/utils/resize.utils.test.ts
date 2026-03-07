import { describe, it, expect } from "vitest";
import {
  getHandlePosition,
  getResizeHandleAtPoint,
  calculateNewBoundingBox,
} from "./resize.utils";

const makeBox = (minX: number, minY: number, maxX: number, maxY: number) => ({
  topLeft: { x: minX, y: minY },
  topRight: { x: maxX, y: minY },
  bottomLeft: { x: minX, y: maxY },
  bottomRight: { x: maxX, y: maxY },
});

describe("resize.utils", () => {
  describe("getHandlePosition", () => {
    it("topLeft 핸들 위치를 반환한다", () => {
      const box = makeBox(100, 100, 200, 200);
      const pos = getHandlePosition("topLeft", box);
      expect(pos.x).toBeLessThanOrEqual(100);
      expect(pos.y).toBeLessThanOrEqual(100);
    });

    it("bottomRight 핸들 위치를 반환한다", () => {
      const box = makeBox(100, 100, 200, 200);
      const pos = getHandlePosition("bottomRight", box);
      expect(pos.x).toBeGreaterThanOrEqual(200);
      expect(pos.y).toBeGreaterThanOrEqual(200);
    });

    it("top/right 등 변 핸들 위치를 반환한다", () => {
      const box = makeBox(0, 0, 100, 100);
      const top = getHandlePosition("top", box);
      expect(top.y).toBeLessThanOrEqual(0);
      expect(top.x).toBe(50);
    });
  });

  describe("getResizeHandleAtPoint", () => {
    it("핸들 위에 있으면 해당 핸들 타입을 반환한다", () => {
      const box = makeBox(100, 100, 200, 200);
      const topLeftPos = getHandlePosition("topLeft", box);
      const handle = getResizeHandleAtPoint(topLeftPos, box);
      expect(handle).toBe("topLeft");
    });

    it("박스 안쪽이면 null", () => {
      const box = makeBox(0, 0, 200, 200);
      const handle = getResizeHandleAtPoint({ x: 100, y: 100 }, box);
      expect(handle).toBe(null);
    });
  });

  describe("calculateNewBoundingBox", () => {
    it("bottomRight 드래그 시 새 박스를 반환한다", () => {
      const initial = makeBox(0, 0, 100, 100);
      const result = calculateNewBoundingBox(
        { x: 150, y: 150 },
        "bottomRight",
        initial,
        { x: 100, y: 100 }
      );
      expect(result.topLeft.x).toBe(0);
      expect(result.topLeft.y).toBe(0);
      expect(result.bottomRight.x).toBeGreaterThan(100);
      expect(result.bottomRight.y).toBeGreaterThan(100);
    });
  });
});
