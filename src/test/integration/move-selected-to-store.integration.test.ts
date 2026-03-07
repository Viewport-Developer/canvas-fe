import { describe, it, expect, beforeEach } from "vitest";
import { useMoveStore } from "../../store/moveStore";
import { usePathStore } from "../../store/pathStore";
import { useSelectionStore } from "../../store/selectionStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makePath } from "./_fixtures";

describe("통합: 선택 + moveSelected → 오프라인 시 pathStore 반영", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    usePathStore.setState({ paths: [], currentPaths: [] });
    useSelectionStore.getState().clearSelection();
  });

  it("yjsData가 null이면 moveSelected 호출해도 pathStore 변경 없음", () => {
    const path = makePath("path-1");
    usePathStore.getState().setPaths([path]);
    useSelectionStore.getState().addSelected("path", "path-1");

    useMoveStore.getState().moveSelected({ x: 10, y: 10 });

    expect(usePathStore.getState().paths).toHaveLength(1);
    expect(usePathStore.getState().paths[0].points[0]).toEqual({ x: 0, y: 0 });
  });
});
