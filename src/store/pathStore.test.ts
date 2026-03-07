import { describe, it, expect, beforeEach } from "vitest";
import { usePathStore } from "./pathStore";

const makePath = (id: string) => ({
  id,
  points: [{ x: 0, y: 0 }],
  color: "#000",
  width: 2,
  boundingBox: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
  },
});

describe("pathStore", () => {
  beforeEach(() => {
    usePathStore.setState({ paths: [], currentPaths: [] });
  });

  it("초기값은 빈 배열", () => {
    expect(usePathStore.getState().paths).toEqual([]);
    expect(usePathStore.getState().currentPaths).toEqual([]);
  });

  it("setPaths, setCurrentPaths로 설정한다", () => {
    const paths = [makePath("p1")];
    usePathStore.getState().setPaths(paths);
    usePathStore.getState().setCurrentPaths(paths);
    expect(usePathStore.getState().paths).toHaveLength(1);
    expect(usePathStore.getState().currentPaths).toHaveLength(1);
  });
});
