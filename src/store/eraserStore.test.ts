import { describe, it, expect, beforeEach } from "vitest";
import { useEraserStore } from "./eraserStore";

describe("eraserStore", () => {
  beforeEach(() => {
    useEraserStore.getState().clearToErase();
  });

  it("초기값은 빈 Set들", () => {
    const { pathsToErase, shapesToErase, textsToErase } = useEraserStore.getState();
    expect(pathsToErase.size).toBe(0);
    expect(shapesToErase.size).toBe(0);
    expect(textsToErase.size).toBe(0);
  });

  it("addToErase로 path/shape/text id를 추가한다", () => {
    useEraserStore.getState().addToErase("path", "p1");
    useEraserStore.getState().addToErase("shape", "s1");
    useEraserStore.getState().addToErase("text", "t1");
    expect(useEraserStore.getState().pathsToErase.has("p1")).toBe(true);
    expect(useEraserStore.getState().shapesToErase.has("s1")).toBe(true);
    expect(useEraserStore.getState().textsToErase.has("t1")).toBe(true);
  });

  it("이미 있으면 중복 추가하지 않는다", () => {
    useEraserStore.getState().addToErase("path", "p1");
    useEraserStore.getState().addToErase("path", "p1");
    expect(useEraserStore.getState().pathsToErase.size).toBe(1);
  });

  it("clearToErase로 전부 비운다", () => {
    useEraserStore.getState().addToErase("path", "p1");
    useEraserStore.getState().clearToErase();
    expect(useEraserStore.getState().pathsToErase.size).toBe(0);
    expect(useEraserStore.getState().shapesToErase.size).toBe(0);
    expect(useEraserStore.getState().textsToErase.size).toBe(0);
  });
});
