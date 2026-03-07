import { describe, it, expect, beforeEach } from "vitest";
import { pushPathToYjs, removePathsFromYjs } from "../../utils/yjsSync.utils";
import { usePathStore } from "../../store/pathStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makePath } from "./_fixtures";

describe("통합: yjsSync 오프라인 → pathStore 연동", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    usePathStore.setState({ paths: [], currentPaths: [] });
  });

  it("pushPathToYjs 후 pathStore에 반영된다", () => {
    const path = makePath("path-1");
    pushPathToYjs(path);
    expect(usePathStore.getState().paths).toHaveLength(1);
    expect(usePathStore.getState().paths[0].id).toBe("path-1");
  });

  it("removePathsFromYjs 후 pathStore에서 제거된다", () => {
    const path = makePath("path-1");
    pushPathToYjs(path);
    removePathsFromYjs(["path-1"]);
    expect(usePathStore.getState().paths).toHaveLength(0);
  });
});
