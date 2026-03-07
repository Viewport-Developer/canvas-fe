import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMoveStore } from "./moveStore";
import { usePathStore } from "./pathStore";
import { useSelectionStore } from "./selectionStore";
import { useYjsConnectionStore } from "./yjsStore";

const mockTransact = vi.fn((fn: () => void) => fn());
const mockPushPathToYjs = vi.fn();
const mockPushShapeToYjs = vi.fn();
const mockPushTextToYjs = vi.fn();

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

const makeBox = (x: number, y: number, w: number, h: number) => ({
  topLeft: { x, y },
  topRight: { x: x + w, y },
  bottomLeft: { x, y: y + h },
  bottomRight: { x: x + w, y: y + h },
});

describe("moveStore", () => {
  beforeEach(() => {
    mockTransact.mockClear();
    mockPushPathToYjs.mockClear();
    mockPushShapeToYjs.mockClear();
    mockPushTextToYjs.mockClear();
    vi.mocked(useYjsConnectionStore.getState).mockReturnValue({ yjsData: null } as never);
    usePathStore.setState({ paths: [], currentPaths: [] });
    useSelectionStore.getState().clearSelection();
  });

  it("yjsData가 null이면 moveSelected가 아무 것도 하지 않는다", () => {
    const path = {
      id: "path-1",
      points: [{ x: 0, y: 0 }],
      color: "#000",
      width: 2,
      boundingBox: makeBox(0, 0, 1, 1),
    };
    usePathStore.getState().setPaths([path]);
    useSelectionStore.getState().addSelected("path", "path-1");

    useMoveStore.getState().moveSelected({ x: 10, y: 10 });

    expect(mockPushPathToYjs).not.toHaveBeenCalled();
  });

  it("yjsData가 있고 선택된 path가 있으면 이동 후 pushPathToYjs 호출", () => {
    vi.mocked(useYjsConnectionStore.getState).mockReturnValue({
      yjsData: {
        paths: { doc: mockDoc },
        shapes: { doc: mockDoc },
        texts: { doc: mockDoc },
      },
    } as never);

    const path = {
      id: "path-1",
      points: [{ x: 0, y: 0 }, { x: 5, y: 5 }],
      color: "#000",
      width: 2,
      boundingBox: makeBox(0, 0, 5, 5),
    };
    usePathStore.getState().setPaths([path]);
    useSelectionStore.getState().addSelected("path", "path-1");

    useMoveStore.getState().moveSelected({ x: 10, y: 10 });

    expect(mockTransact).toHaveBeenCalled();
    expect(mockPushPathToYjs).toHaveBeenCalled();
    const movedPath = mockPushPathToYjs.mock.calls[0][0];
    expect(movedPath.points[0]).toEqual({ x: 10, y: 10 });
    expect(movedPath.points[1]).toEqual({ x: 15, y: 15 });
  });
});