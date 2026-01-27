import { useState, useCallback } from "react";
import type { Point, Text } from "../types";
import { useTextStore } from "../store/textStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { calculateTextBoundingBox, isPointInBoundingBox } from "../utils/boundingBox.utils";

export const useText = () => {
  const { texts, addText, updateTextWithBoundingBox, removeTexts } = useTextStore();
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

  // 실시간 텍스트 업데이트 (입력 중 동기화)
  const updateTextInRealTime = useCallback(
    (content: string, zoom: number = 1) => {
      if (!createPosition) return;

      if (editingTextId) {
        // 기존 텍스트 편집 중
        const existingText = texts.find((text) => text.id === editingTextId);
        if (!existingText) return;

        const fontSize = existingText.fontSize;
        const boundingBox = calculateTextBoundingBox(content, existingText.position, fontSize);
        updateTextWithBoundingBox(editingTextId, content, boundingBox);
      } else {
        // 새 텍스트 생성 중 (첫 글자 입력 시)
        // 빈 텍스트는 생성하지 않음 (사용자가 입력을 시작할 때만 생성)
        if (!content.trim()) return;

        // 실제 텍스트 시작 위치 계산
        const paddingTop = -8;
        const paddingLeft = 0.5;
        const paddingOffsetX = paddingLeft / zoom;
        const paddingOffsetY = paddingTop / zoom;

        const actualPosition: Point = {
          x: createPosition.x + paddingOffsetX,
          y: createPosition.y + paddingOffsetY,
        };

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
        // 새 텍스트 ID를 editingTextId로 설정하여 이후 업데이트가 가능하도록 함
        setEditingTextId(newText.id);
        setCreatePosition(actualPosition);
      }
    },
    [createPosition, editingTextId, texts, updateTextWithBoundingBox, addText]
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
        removeTexts([editingTextId]);
        saveTextAction([existingText], []);
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
      // 새 텍스트인 경우, 이미 updateTextInRealTime에서 생성되었을 수 있음
      // editingTextId가 설정되었는지 확인
      if (editingTextId) {
        // 이미 생성된 텍스트가 있으면
        const existingText = texts.find((text) => text.id === editingTextId);
        if (existingText) {
          // 빈 텍스트면 삭제
          if (!content.trim()) {
            removeTexts([editingTextId]);
            saveTextAction([existingText], []);
          } else {
            // 히스토리만 저장
            saveTextAction([], [existingText]);
          }
        }
      } else {
        // 아직 생성되지 않은 경우에만 생성
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
      }

      setCreatePosition(null);
      setEditingTextId(null);
    }
  },
    [createPosition, editingTextId, texts, updateTextWithBoundingBox, saveTextAction, addText, removeTexts]
  );

  return {
    createPosition,
    editingTextId,
    startCreating,
    finishCreating,
    updateTextInRealTime,
  };
};
