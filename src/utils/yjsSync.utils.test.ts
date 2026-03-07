import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePathStore } from "../store/pathStore";
import { useShapeStore } from "../store/shapeStore";
import { useTextStore } from "../store/textStore";
import {
  pushPathToYjs,
  removePathsFromYjs,
  pushShapeToYjs,
  removeShapesFromYjs,
  pushTextToYjs,
  removeTextsFromYjs,
} from "./yjsSync.utils";

vi.mock("../store/yjsStore", () => ({
  useYjsConnectionStore: {
    getState: vi.fn(() => ({ yjsData: null, awareness: null })),
  },
}));

const makeBox = (x: number, y: number, w: number, h: number) => ({
  topLeft: { x, y },
  topRight: { x: x + w, y },
  bottomLeft: { x, y: y + h },
  bottomRight: { x: x + w, y: y + h },
});

describe("yjsSync.utils (오프라인 분기)", () => {
  beforeEach(() => {
    usePathStore.setState({ paths: [], currentPaths: [] });
    useShapeStore.setState({ shapes: [], currentShapes: [] });
    useTextStore.setState({ texts: [], currentTexts: [] });
  });

  describe("pushPathToYjs", () => {
    it("오프라인일 때 path를 pathStore에 추가한다", () => {
      const path = {
        id: "path-1",
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 10, 10),
      };
      pushPathToYjs(path);
      expect(usePathStore.getState().paths).toHaveLength(1);
      expect(usePathStore.getState().paths[0].id).toBe("path-1");
    });

    it("같은 id가 있으면 업데이트한다", () => {
      const path = {
        id: "path-1",
        points: [{ x: 0, y: 0 }],
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 1, 1),
      };
      pushPathToYjs(path);
      const updated = { ...path, points: [{ x: 5, y: 5 }], boundingBox: makeBox(5, 5, 1, 1) };
      pushPathToYjs(updated);
      expect(usePathStore.getState().paths).toHaveLength(1);
      expect(usePathStore.getState().paths[0].points[0]).toEqual({ x: 5, y: 5 });
    });
  });

  describe("removePathsFromYjs", () => {
    it("오프라인일 때 pathStore에서 해당 id를 제거한다", () => {
      const path = {
        id: "path-1",
        points: [],
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 1, 1),
      };
      pushPathToYjs(path);
      expect(usePathStore.getState().paths).toHaveLength(1);
      removePathsFromYjs(["path-1"]);
      expect(usePathStore.getState().paths).toHaveLength(0);
    });
  });

  describe("pushShapeToYjs", () => {
    it("오프라인일 때 shape를 shapeStore에 추가한다", () => {
      const shape = {
        id: "shape-1",
        type: "rectangle" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 10, y: 10 },
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 10, 10),
      };
      pushShapeToYjs(shape);
      expect(useShapeStore.getState().shapes).toHaveLength(1);
      expect(useShapeStore.getState().shapes[0].id).toBe("shape-1");
    });
  });

  describe("removeShapesFromYjs", () => {
    it("오프라인일 때 shapeStore에서 해당 id를 제거한다", () => {
      const shape = {
        id: "shape-1",
        type: "rectangle" as const,
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 10, y: 10 },
        color: "#000",
        width: 2,
        boundingBox: makeBox(0, 0, 10, 10),
      };
      pushShapeToYjs(shape);
      removeShapesFromYjs(["shape-1"]);
      expect(useShapeStore.getState().shapes).toHaveLength(0);
    });
  });

  describe("pushTextToYjs", () => {
    it("오프라인일 때 text를 textStore에 추가한다", () => {
      const text = {
        id: "text-1",
        position: { x: 0, y: 0 },
        content: "hi",
        color: "#000",
        fontSize: 16,
        boundingBox: makeBox(0, 0, 10, 16),
      };
      pushTextToYjs(text);
      expect(useTextStore.getState().texts).toHaveLength(1);
      expect(useTextStore.getState().texts[0].id).toBe("text-1");
    });
  });

  describe("removeTextsFromYjs", () => {
    it("오프라인일 때 textStore에서 해당 id를 제거한다", () => {
      const text = {
        id: "text-1",
        position: { x: 0, y: 0 },
        content: "hi",
        color: "#000",
        fontSize: 16,
        boundingBox: makeBox(0, 0, 10, 16),
      };
      pushTextToYjs(text);
      removeTextsFromYjs(["text-1"]);
      expect(useTextStore.getState().texts).toHaveLength(0);
    });
  });
});
