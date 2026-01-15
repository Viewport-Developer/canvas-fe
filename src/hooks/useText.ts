import { useState } from "react";
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

  // 텍스트 생성을 시작합니다 (클릭 위치 저장)
  // 기존 텍스트의 바운딩 박스 안을 클릭했는지 확인하여 편집 모드로 전환
  const startCreating = (point: Point): boolean => {
    // 기존 텍스트 중 클릭한 위치가 바운딩 박스 안에 있는지 확인
    const clickedText = texts.find((text) => isPointInBoundingBox(point, text.boundingBox));

    if (clickedText) {
      // 편집 모드로 전환
      setEditingTextId(clickedText.id);
      setCreatePosition(clickedText.position);
      return true;
    } else {
      // 새로 생성 모드
      setEditingTextId(null);
      setCreatePosition(point);
      return true;
    }
  };

  // 텍스트 편집을 종료하고 store에 저장합니다
  const finishCreating = (content: string, actualPosition: Point, zoom: number = 1) => {
    if (!createPosition) {
      setCreatePosition(null);
      setEditingTextId(null);
      return;
    }

    if (editingTextId) {
      // 편집 모드: 기존 텍스트 업데이트
      const existingText = texts.find((text) => text.id === editingTextId);
      if (!existingText) {
        setCreatePosition(null);
        setEditingTextId(null);
        return;
      }

      // 빈 텍스트면 삭제 (히스토리 저장 필요)
      if (!content.trim()) {
        // 삭제는 여기서 처리하지 않고, 사용자가 직접 삭제하도록 함
        // 또는 삭제 액션을 별도로 처리할 수 있음
        setCreatePosition(null);
        setEditingTextId(null);
        return;
      }

      // 기존 텍스트와 새 텍스트 비교하여 변경사항이 있으면 히스토리 저장
      const fontSize = existingText.fontSize; // 편집 시 폰트 사이즈는 유지
      // 편집 모드에서는 위치는 변경하지 않고 기존 위치 사용
      const boundingBox = calculateTextBoundingBox(content, existingText.position, fontSize);

      // 변경사항이 있는지 확인
      const hasChanges = existingText.content !== content;

      if (hasChanges) {
        // 편집 모드에서는 위치는 변경하지 않고 내용만 업데이트
        updateTextWithBoundingBox(editingTextId, content, boundingBox);
        saveTextAction([existingText], [{ ...existingText, content, boundingBox }]);
      }

      setCreatePosition(null);
      setEditingTextId(null);
    } else {
      // 생성 모드: 새 텍스트 추가
      // 빈 텍스트면 저장하지 않음
      if (!content.trim()) {
        setCreatePosition(null);
        return;
      }

      // 줌 레벨을 고려하여 fontSize 계산 (줌이 클수록 작은 값 저장)
      const fontSize = CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE / zoom;
      const boundingBox = calculateTextBoundingBox(content, actualPosition, fontSize);

      // 새 텍스트 생성 및 store에 저장
      const newText: Text = {
        id: `text-${Date.now()}`,
        position: actualPosition,
        content,
        color: CANVAS_CONFIG.DEFAULT_TEXT_COLOR,
        fontSize,
        boundingBox,
      };

      addText(newText);
      saveTextAction([], [newText]);

      // 상태 정리
      setCreatePosition(null);
    }
  };

  return {
    createPosition,
    editingTextId,
    startCreating,
    finishCreating,
  };
};
