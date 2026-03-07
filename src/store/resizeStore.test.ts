import { describe, it, expect, beforeEach, vi } from "vitest";
import { useResizeStore } from "./resizeStore";
import { usePathStore } from "./pathStore";
import { useShapeStore } from "./shapeStore";
import { useTextStore } from "./textStore";
import { useSelectionStore } from "./selectionStore";
import { useYjsConnectionStore } from "./yjsStore";

const mockTransact = vi.fn((fn: () => void) => fn());
const mockPushPathToYjs = vi.fn();
const mockPushShapeToYjs = vi.fn();
const mockPushTextToYjs = vi.fn();

const makeBox = (x: number, y: number, w: number, h: number) => ({
  topLeft: { x, y },
  topRight: { x: x + w, y },
  bottomLeft: { x, y: y + h },
  bottomRight: { x: x + w, y: y + h },
});

vi.mock("../utils", () => ({
  scalePathByCombinedBoundingBox: vi.fn((path: { id: string }) => ({ ...path, points: [], boundingBox: makeBox(0, 0, 10, 10) })),
  scaleShapeByCombinedBoundingBox: vi.fn((shape: { id: string }) => ({ ...shape, boundingBox: makeBox(0, 0, 10, 10) })),
  scaleTextByCombinedBoundingBox: vi.fn((text: { id: string }) => ({ ...text, boundingBox: makeBox(0, 0, 10, 10) })),
}));

vi.mock("../utils/yjsSync.utils", () => ({
  pushPathToYjs: (...args: unknown[]) => mockPushPathToYjs(...args),
  pushShapeToYjs: (...args: unknown[]) => mockPushShapeToYjs(...args),
  pushTextToYjs: (...args: unknown[]) => mockPushTextToYjs(...args),
}));

const mockDoc = { transact: mockTransact };

vi.mock("./yjsStore", () => ({
  useYjsConnectionStore: {
    getState: vi.fn(() => ({ yjsData: null })),
  },
}));

describe("resizeStore", () => {
  beforeEach(() => {
    mockTransact.mockClear();
    mockPushPathToYjs.mockClear();
    mockPushShapeToYjs.mockClear();
    mockPushTextToYjs.mockClear();
    vi.mocked(useYjsConnectionStore.getState).mockReturnValue({ yjsData: null } as never);
    usePathStore.setState({ paths: [], currentPaths: [] });
    useShapeStore.setState({ shapes: [], currentShapes: [] });
    useTextStore.setState({ texts: [], currentTexts: [] });
    useSelectionStore.getState().clearSelection();
  });

  it("yjsData가 null이면 resizeSelected가 아무 것도 하지 않는다", () => {
    useResizeStore.getState().resizeSelected({
      newBoundingBox: makeBox(0, 0, 20, 20),
      initialBoundingBox: makeBox(0, 0, 10, 10),
      initialPaths: [],
      initialShapes: [],
      initialTexts: [],
      resizeHandle: "bottomRight",
    });
    expect(mockPushPathToYjs).not.toHaveBeenCalled();
  });

  it("yjsData가 있고 선택된 path가 있으면 스케일 후 pushPathToYjs 호출", () => {
    vi.mocked(useYjsConnectionStore.getState).mockReturnValue({
      yjsData: {
        paths: { doc: mockDoc },
        shapes: { doc: mockDoc },
        texts: { doc: mockDoc },
      },
    } as never);

    const path = {
      id: "path-1",
      points: [{ x: 0, y: 0 }],
      color: "#000",
      width: 2,
      boundingBox: makeBox(0, 0, 10, 10),
    };
    usePathStore.getState().setPaths([path]);
    useSelectionStore.getState().addSelected("path", "path-1");

    useResizeStore.getState().resizeSelected({
      newBoundingBox: makeBox(0, 0, 20, 20),
      initialBoundingBox: makeBox(0, 0, 10, 10),
      initialPaths: [path],
      initialShapes: [],
      initialTexts: [],
      resizeHandle: "bottomRight",
    });

    expect(mockTransact).toHaveBeenCalled();
    expect(mockPushPathToYjs).toHaveBeenCalled();
  });
});
