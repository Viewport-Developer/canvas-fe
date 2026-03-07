import { describe, it, expect, beforeEach, vi } from "vitest";
import { useResizeStore } from "../../store/resizeStore";
import { usePathStore } from "../../store/pathStore";
import { useSelectionStore } from "../../store/selectionStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makePath, makeBox } from "./_fixtures";

const mockTransact = vi.fn((fn: () => void) => fn());
const mockPushPathToYjs = vi.fn();

vi.mock("../../utils/yjsSync.utils", () => ({
  pushPathToYjs: (...args: unknown[]) => mockPushPathToYjs(...args),
  pushShapeToYjs: vi.fn(),
  pushTextToYjs: vi.fn(),
}));

describe("통합: resizeSelected → 스케일 후 push 호출", () => {
  beforeEach(() => {
    mockTransact.mockClear();
    mockPushPathToYjs.mockClear();
    usePathStore.setState({ paths: [], currentPaths: [] });
    useSelectionStore.getState().clearSelection();
    useYjsConnectionStore.getState().resetConnection();
  });

  it("yjsData 있고 선택 path 있을 때 resizeSelected 호출 시 pushPathToYjs 호출된다", () => {
    useYjsConnectionStore.setState({
      yjsData: {
        paths: { doc: { transact: mockTransact } },
        shapes: { doc: { transact: mockTransact } },
        texts: { doc: { transact: mockTransact } },
      },
    } as never);
    const path = makePath("path-1");
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
