import { describe, it, expect } from "vitest";
import {
  scalePathByCombinedBoundingBox,
  scaleShapeByCombinedBoundingBox,
  scaleTextByCombinedBoundingBox,
} from "./scaling.utils";

const makeBox = (minX: number, minY: number, maxX: number, maxY: number) => ({
  topLeft: { x: minX, y: minY },
  topRight: { x: maxX, y: minY },
  bottomLeft: { x: minX, y: maxY },
  bottomRight: { x: maxX, y: maxY },
});

describe("scaling.utils", () => {
  const initialPathBox = makeBox(0, 0, 100, 100);
  const initialCombined = makeBox(0, 0, 100, 100);
  const newCombined = makeBox(0, 0, 200, 200);

  describe("scalePathByCombinedBoundingBox", () => {
    it("결합 박스 비율에 맞게 경로를 스케일한다", () => {
      const path = {
        id: "p1",
        points: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
        color: "#000",
        width: 2,
        boundingBox: initialPathBox,
      };
      const scaled = scalePathByCombinedBoundingBox(
        path,
        initialPathBox,
        initialCombined,
        newCombined
      );
      expect(scaled.points.length).toBe(2);
      expect(scaled.boundingBox.topRight.x).toBeGreaterThan(100);
    });
  });

  describe("scaleShapeByCombinedBoundingBox", () => {
    it("결합 박스 비율에 맞게 도형을 스케일한다", () => {
      const shape = {
        id: "s1",
        type: "rectangle" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 },
        color: "#000",
        width: 2,
        boundingBox: initialPathBox,
      };
      const scaled = scaleShapeByCombinedBoundingBox(
        shape,
        initialPathBox,
        initialCombined,
        newCombined
      );
      expect(scaled.startPoint.x).toBe(0);
      expect(scaled.endPoint.x).toBeGreaterThan(100);
    });
  });

  describe("scaleTextByCombinedBoundingBox", () => {
    it("결합 박스 비율에 맞게 텍스트를 스케일한다", () => {
      const text = {
        id: "t1",
        position: { x: 0, y: 0 },
        content: "hi",
        color: "#000",
        fontSize: 16,
        boundingBox: initialPathBox,
      };
      const scaled = scaleTextByCombinedBoundingBox(
        text,
        initialPathBox,
        initialCombined,
        newCombined
      );
      expect(scaled.fontSize).toBeGreaterThan(16);
      expect(scaled.position).toBeDefined();
    });
  });
});
