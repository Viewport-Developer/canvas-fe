import { describe, it, expect, beforeEach } from "vitest";
import { useYjsConnectionStore, createYjsDoc, getYjsData } from "./yjsStore";

describe("yjsStore", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
  });

  it("초기값은 yjsData·awareness·clientId null, remoteCursors 빈 Map", () => {
    const state = useYjsConnectionStore.getState();
    expect(state.yjsData).toBe(null);
    expect(state.awareness).toBe(null);
    expect(state.clientId).toBe(null);
    expect(state.remoteCursors.size).toBe(0);
  });

  it("setYjsData, setAwareness, setClientId로 설정한다", () => {
    const doc = createYjsDoc();
    const yjsData = getYjsData(doc);
    useYjsConnectionStore.getState().setYjsData(yjsData);
    useYjsConnectionStore.getState().setClientId(123);

    expect(useYjsConnectionStore.getState().yjsData).toBe(yjsData);
    expect(useYjsConnectionStore.getState().clientId).toBe(123);
  });

  it("setRemoteCursors로 원격 커서를 설정한다", () => {
    const cursors = new Map([
      [1, { position: { x: 10, y: 20 }, color: "#2196f3" }],
    ]);
    useYjsConnectionStore.getState().setRemoteCursors(cursors);
    expect(useYjsConnectionStore.getState().remoteCursors.get(1)).toEqual({
      position: { x: 10, y: 20 },
      color: "#2196f3",
    });
  });

  it("updateCursorPosition은 awareness가 null이면 아무 것도 하지 않는다", () => {
    expect(() => {
      useYjsConnectionStore.getState().updateCursorPosition({ x: 5, y: 5 });
    }).not.toThrow();
  });

  it("resetConnection으로 전부 초기화한다", () => {
    useYjsConnectionStore.getState().setClientId(999);
    useYjsConnectionStore.getState().setRemoteCursors(new Map([[1, { position: null, color: "#9c27b0" }]]));
    useYjsConnectionStore.getState().resetConnection();

    expect(useYjsConnectionStore.getState().yjsData).toBe(null);
    expect(useYjsConnectionStore.getState().awareness).toBe(null);
    expect(useYjsConnectionStore.getState().clientId).toBe(null);
    expect(useYjsConnectionStore.getState().remoteCursors.size).toBe(0);
  });
});

describe("createYjsDoc / getYjsData", () => {
  it("createYjsDoc은 Y.Doc 인스턴스를 반환한다", () => {
    const doc = createYjsDoc();
    expect(doc).toBeDefined();
    expect(typeof doc.getMap).toBe("function");
  });

  it("getYjsData는 doc에서 paths, shapes, texts Map을 반환한다", () => {
    const doc = createYjsDoc();
    const data = getYjsData(doc);
    expect(data.paths).toBeDefined();
    expect(data.shapes).toBeDefined();
    expect(data.texts).toBeDefined();
    expect(data.paths.get("nonexistent")).toBeUndefined();
  });
});
