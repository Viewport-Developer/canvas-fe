import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useText } from "../../hooks/useText";
import { useTextStore } from "../../store/textStore";
import { useHistoryStore } from "../../store/historyStore";
import { useYjsConnectionStore } from "../../store/yjsStore";
import { makeText } from "./_fixtures";

describe("통합: 텍스트 완료 → 스토어·히스토리 반영 (오프라인)", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().resetConnection();
    useTextStore.setState({ texts: [], currentTexts: [] });
    useHistoryStore.setState({ undoStack: [], redoStack: [] });
  });

  it("기존 텍스트 편집 후 finishTexting 시 saveTextAction이 히스토리에 쌓인다", () => {
    const text = makeText("text-1", "before");
    text.boundingBox = { topLeft: { x: 0, y: 0 }, topRight: { x: 10, y: 0 }, bottomLeft: { x: 0, y: 16 }, bottomRight: { x: 10, y: 16 } };
    useTextStore.getState().setTexts([text]);

    const { result } = renderHook(() => useText());
    act(() => {
      result.current.startTexting({ x: 5, y: 5 });
    });
    expect(result.current.editingTextId).toBe("text-1");

    act(() => {
      result.current.finishTexting("after");
    });

    expect(useHistoryStore.getState().undoStack).toHaveLength(1);
    expect(useHistoryStore.getState().undoStack[0].type).toBe("text");
  });
});
