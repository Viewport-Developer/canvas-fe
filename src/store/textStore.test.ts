import { describe, it, expect, beforeEach } from "vitest";
import { useTextStore } from "./textStore";

const makeText = (id: string) => ({
  id,
  position: { x: 0, y: 0 },
  content: "hello",
  color: "#000",
  fontSize: 16,
  boundingBox: {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 10, y: 0 },
    bottomLeft: { x: 0, y: 16 },
    bottomRight: { x: 10, y: 16 },
  },
});

describe("textStore", () => {
  beforeEach(() => {
    useTextStore.setState({ texts: [], currentTexts: [] });
  });

  it("초기값은 빈 배열", () => {
    expect(useTextStore.getState().texts).toEqual([]);
    expect(useTextStore.getState().currentTexts).toEqual([]);
  });

  it("setTexts, setCurrentTexts로 설정한다", () => {
    const texts = [makeText("t1")];
    useTextStore.getState().setTexts(texts);
    useTextStore.getState().setCurrentTexts(texts);
    expect(useTextStore.getState().texts).toHaveLength(1);
    expect(useTextStore.getState().currentTexts).toHaveLength(1);
  });
});
