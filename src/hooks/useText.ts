import { useState, useCallback } from "react";
import type { Point, Text } from "../types";
import { useTextStore } from "../store/textStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { calculateTextBoundingBox, isPointInBoundingBox } from "../utils/boundingBox.utils";

export const useText = () => {
  const { texts, addText, updateTextWithBoundingBox } = useTextStore();
  const { saveTextAction } = useHistoryStore();

  const [createPosition, setCreatePosition] = useState<Point | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // 텍스트 생성을 시작합니다
  const startCreating = useCallback(
    (point: Point): boolean => {
    // 기존 텍스트가 클릭됐는지 확인
    const clickedText = texts.find((text) => isPointInBoundingBox(point, text.boundingBox));

    if (clickedText) {
      setEditingTextId(clickedText.id);
      setCreatePosition(clickedText.position);
      return true;
    } else {
      setEditingTextId(null);
      setCreatePosition(point);
      return true;
    }
  },
    [texts]
  );

  // 텍스트 편집을 종료하고 store에 저장합니다
  const finishCreating = useCallback(
    (content: string, actualPosition: Point, zoom: number = 1) => {
    if (!createPosition) {
      setCreatePosition(null);
      setEditingTextId(null);
      return;
    }

    if (editingTextId) {
      const existingText = texts.find((text) => text.id === editingTextId);
      if (!existingText) {
        setCreatePosition(null);
        setEditingTextId(null);
        return;
      }

      // 빈 텍스트면 삭제
      if (!content.trim()) {
        setCreatePosition(null);
        setEditingTextId(null);
        return;
      }

      const fontSize = existingText.fontSize;
      const boundingBox = calculateTextBoundingBox(content, existingText.position, fontSize);

      // 변경사항이 있는지 확인
      const hasChanges = existingText.content !== content;

      if (hasChanges) {
        updateTextWithBoundingBox(editingTextId, content, boundingBox);
        saveTextAction([existingText], [{ ...existingText, content, boundingBox }]);
      }

      setCreatePosition(null);
      setEditingTextId(null);
    } else {
      if (!content.trim()) {
        setCreatePosition(null);
        return;
      }

      const fontSize = CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE / zoom;
      const boundingBox = calculateTextBoundingBox(content, actualPosition, fontSize);

      const newText: Text = {
        id: `text-${crypto.randomUUID()}`,
        position: actualPosition,
        content,
        color: CANVAS_CONFIG.DEFAULT_TEXT_COLOR,
        fontSize,
        boundingBox,
      };

      addText(newText);
      saveTextAction([], [newText]);

      setCreatePosition(null);
    }
  },
    [createPosition, editingTextId, texts, updateTextWithBoundingBox, saveTextAction, addText]
  );

  return {
    createPosition,
    editingTextId,
    startCreating,
    finishCreating,
  };
};
