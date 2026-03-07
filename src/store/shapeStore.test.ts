import { describe, it, expect, beforeEach } from "vitest";
import { useShapeStore } from "./shapeStore";

const makeShape = (id: string) => ({
  id,
  type: "rectangle" as const,
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 10, y: 10 },
  color: "#000",
  width: 2,
  boundingBox: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 10, y: 0 },
    bottomLeft: { x: 0, y: 10 },
    bottomRight: { x: 10, y: 10 },
  },
});

describe("shapeStore", () => {
  beforeEach(() => {
    useShapeStore.setState({ shapes: [], currentShapes: [] });
  });

  it("초기값은 빈 배열", () => {
    expect(useShapeStore.getState().shapes).toEqual([]);
    expect(useShapeStore.getState().currentShapes).toEqual([]);
  });

  it("setShapes, setCurrentShapes로 설정한다", () => {
    const shapes = [makeShape("s1")];
    useShapeStore.getState().setShapes(shapes);
    useShapeStore.getState().setCurrentShapes(shapes);
    expect(useShapeStore.getState().shapes).toHaveLength(1);
    expect(useShapeStore.getState().currentShapes).toHaveLength(1);
  });
});
