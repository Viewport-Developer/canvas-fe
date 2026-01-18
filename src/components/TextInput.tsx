import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

const StyledTextInput = styled.textarea<{ $x: number; $y: number; $fontSize: number; $zoom: number }>`
  position: absolute;
  top: ${(props) => props.$y}px;
  left: ${(props) => props.$x}px;
  border: none;
  outline: none;
  background: transparent;
  color: ${CANVAS_CONFIG.DEFAULT_TEXT_COLOR};
  font-size: ${(props) => props.$fontSize * props.$zoom}px;
  line-height: ${(props) => (props.$fontSize + CANVAS_CONFIG.DEFAULT_TEXT_LINE_HEIGHT_OFFSET) * props.$zoom}px;
  font-family: sans-serif;
  resize: none;
  white-space: pre;
  overflow-x: auto;
  overflow-y: hidden;
  width: auto;
  padding: 0;
  z-index: 100;
`;

type TextInputProps = {
  createPosition: Point;
  editingTextId?: string | null;
  initialContent?: string;
  fontSize?: number;
  zoom: number;
  pan: Point;
  onFinish: (content: string, actualPosition: Point, zoom: number) => void;
};

const TextInput = ({
  createPosition,
  editingTextId,
  initialContent = "",
  fontSize,
  zoom,
  pan,
  onFinish,
}: TextInputProps) => {
  const [inputValue, setInputValue] = useState(initialContent);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // 캔버스 좌표를 화면 좌표로 변환
  const inputPosition = useMemo(() => {
    // 실제 텍스트 시작 위치 계산 (textarea의 border와 padding 고려)
    const paddingTop = 11;
    const paddingLeft = -0.5;

    const paddingOffsetX = paddingLeft / zoom;
    const paddingOffsetY = paddingTop / zoom;

    let adjustedX: number;
    let adjustedY: number;

    if (editingTextId) {
      adjustedX = createPosition.x;
      adjustedY = createPosition.y - 3;
    } else {
      adjustedX = createPosition.x - paddingOffsetX;
      adjustedY = createPosition.y - paddingOffsetY;
    }

    const screenX = (adjustedX - pan.x) * zoom;
    const screenY = (adjustedY - pan.y) * zoom;

    return { x: screenX, y: screenY };
  }, [createPosition, zoom, pan, editingTextId]);

  // textarea 크기 조절 함수
  const adjustSize = useCallback(() => {
    if (textInputRef.current) {
      // 너비 조절
      textInputRef.current.style.width = "auto";
      const scrollWidth = textInputRef.current.scrollWidth;
      textInputRef.current.style.width = `${scrollWidth + 4}px`;

      // 높이 조절
      textInputRef.current.style.height = "auto";
      const scrollHeight = textInputRef.current.scrollHeight;
      textInputRef.current.style.height = `${scrollHeight}px`;
    }
  }, []);

  // 포커스 설정 및 초기 크기 조절
  useEffect(() => {
    if (!inputPosition) return;

    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        adjustSize();
      }
    }, 0);
  }, [inputPosition, adjustSize]);

  // inputValue 변경 시 크기 조절
  useEffect(() => {
    adjustSize();
  }, [inputValue, adjustSize]);

  // finish 처리
  const handleFinish = useCallback(() => {
    // 실제 텍스트 시작 위치 계산 (textarea의 border와 padding 고려)
    const paddingTop = -8;
    const paddingLeft = 0.5;

    const paddingOffsetX = paddingLeft / zoom;
    const paddingOffsetY = paddingTop / zoom;

    const actualPosition: Point = {
      x: createPosition.x + paddingOffsetX,
      y: createPosition.y + paddingOffsetY,
    };

    onFinish(inputValue, actualPosition, zoom);
    setInputValue("");
  }, [inputValue, createPosition, zoom, onFinish]);

  // 폰트 사이즈가 없으면 기본값 사용
  const displayFontSize = fontSize || CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE / zoom;

  return (
    <StyledTextInput
      ref={textInputRef}
      $x={inputPosition.x}
      $y={inputPosition.y}
      $fontSize={displayFontSize}
      $zoom={zoom}
      value={inputValue}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
      }}
      onBlur={handleFinish}
      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Escape") {
          handleFinish();
        }
      }}
    />
  );
};

export default TextInput;
