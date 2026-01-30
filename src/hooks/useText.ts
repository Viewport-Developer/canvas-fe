import { useState, useCallback } from "react";
import type { Point, Text } from "../types";
import { useTextStore } from "../store/textStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import {
  calculateTextBoundingBox,
  isPointInBoundingBox,
  getCurrentTextFromAwareness,
  pushTextToYjs,
  removeTextsFromYjs,
  setCurrentTextToAwareness,
} from "../utils";

export const useText = () => {
  const { texts } = useTextStore();
  const { saveTextAction } = useHistoryStore();

  const [createPosition, setCreatePosition] = useState<Point | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [initialText, setInitialText] = useState<Text | null>(null);

  // 텍스트 편집/생성 시작
  const startTexting = useCallback(
    (point: Point) => {
      const clickedText = texts.find((text) => isPointInBoundingBox(point, text.boundingBox));

      if (clickedText) {
        setEditingTextId(clickedText.id);
        setCreatePosition(clickedText.position);
        setInitialText({ ...clickedText });
        return;
      }

      const newText: Text = {
        id: `text-${crypto.randomUUID()}`,
        position: point,
        content: "",
        color: CANVAS_CONFIG.DEFAULT_TEXT_COLOR,
        fontSize: CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE,
        boundingBox: calculateTextBoundingBox("", point, CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE),
      };

      setInitialText(null);
      setCurrentTextToAwareness(newText);
      setEditingTextId(newText.id);
      setCreatePosition(point);
    },
    [texts],
  );

  // 실시간 텍스트 업데이트
  const updateText = useCallback(
    (content: string, zoom: number = 1) => {
      const isExisting = texts.some((t) => t.id === editingTextId);

      if (isExisting) {
        const clickedText = texts.find((t) => t.id === editingTextId);
        if (!clickedText) return;

        const boundingBox = calculateTextBoundingBox(content, clickedText.position, clickedText.fontSize);
        const newText: Text = { ...clickedText, content, boundingBox };

        removeTextsFromYjs([editingTextId!]);
        pushTextToYjs(newText);
        return;
      }

      // 새 텍스트: currentText만 갱신
      const currentText = getCurrentTextFromAwareness();
      if (!currentText) return;

      const paddingTop = -8;
      const paddingLeft = 0.5;
      const paddingOffsetX = paddingLeft / zoom;
      const paddingOffsetY = paddingTop / zoom;
      const actualPosition: Point = {
        x: (createPosition?.x ?? currentText.position.x) + paddingOffsetX,
        y: (createPosition?.y ?? currentText.position.y) + paddingOffsetY,
      };
      const fontSize = CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE / zoom;
      const boundingBox = calculateTextBoundingBox(content, actualPosition, fontSize);
      const newText: Text = {
        ...currentText,
        position: actualPosition,
        content,
        fontSize,
        boundingBox,
      };

      setCurrentTextToAwareness(newText);
      setCreatePosition(actualPosition);
    },
    [texts, createPosition, editingTextId],
  );

  // 텍스트 편집 종료. 기존 텍스트: 수정 전 원본을 previousText로 히스토리 저장. 새 텍스트: currentText → Yjs push 후 clear.
  const finishTexting = useCallback(
    (content: string) => {
      const isExisting = texts.some((t) => t.id === editingTextId);

      if (isExisting) {
        const currentText = texts.find((t) => t.id === editingTextId);
        if (initialText && currentText) {
          saveTextAction(initialText, currentText);
        }
        setInitialText(null);
        setCreatePosition(null);
        setEditingTextId(null);
        return;
      }

      // 새 텍스트: currentText만 사용했으므로 여기서 Yjs에 반영 후 clear
      const currentText = getCurrentTextFromAwareness();
      if (!currentText) return;

      const boundingBox = calculateTextBoundingBox(content, currentText.position, currentText.fontSize);
      const newText: Text = { ...currentText, content, boundingBox };

      pushTextToYjs(newText);
      setCurrentTextToAwareness(null);
      saveTextAction(initialText, newText);
      setCreatePosition(null);
      setEditingTextId(null);
    },
    [texts, editingTextId, initialText, saveTextAction],
  );

  return {
    createPosition,
    editingTextId,
    startTexting,
    finishTexting,
    updateText,
  };
};
