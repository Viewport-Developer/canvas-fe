import { useState } from "react";
import type { Point, Text } from "../types";
import { useTextStore } from "../store/textStore";
import { useHistoryStore } from "../store/historyStore";
import { CANVAS_CONFIG } from "../constants/canvas.constants";
import { calculateTextBoundingBox } from "../utils/boundingBox.utils";

export const useText = () => {
  const { addText } = useTextStore();
  const { saveTextAction } = useHistoryStore();

  const [createPosition, setCreatePosition] = useState<Point | null>(null);

  // 텍스트 생성을 시작합니다 (클릭 위치 저장)
  const startCreating = (point: Point): boolean => {
    setCreatePosition(point);
    return true;
  };

  // 텍스트 편집을 종료하고 store에 저장합니다
  const finishCreating = (content: string, actualPosition: Point, zoom: number = 1) => {
    if (!createPosition) {
      setCreatePosition(null);
      return;
    }

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
  };

  return {
    createPosition,
    startCreating,
    finishCreating,
  };
};
