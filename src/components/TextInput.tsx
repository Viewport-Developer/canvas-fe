import { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

type TextInputProps = {
  createPosition: Point;
  zoom: number;
  pan: Point;
  onFinish: (content: string, actualPosition: Point, zoom: number) => void;
};

const StyledTextInput = styled.textarea<{ $x: number; $y: number; $zoom: number }>`
  position: absolute;
  top: ${(props) => props.$y}px;
  left: ${(props) => props.$x}px;
  border: 1px solid #5b57d1;
  outline: none;
  background: transparent;
  color: ${CANVAS_CONFIG.DEFAULT_TEXT_COLOR};
  font-size: ${CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE}px;
  line-height: ${CANVAS_CONFIG.DEFAULT_TEXT_FONT_SIZE + CANVAS_CONFIG.DEFAULT_TEXT_LINE_HEIGHT_OFFSET}px;
  font-family: sans-serif;
  resize: none;
  white-space: pre;
  overflow-x: auto;
  overflow-y: hidden;
  width: auto;
  padding: 0;
  z-index: 100;
`;

const TextInput = ({ createPosition, zoom, pan, onFinish }: TextInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // 캔버스 좌표를 화면 좌표로 변환 (컨테이너 기준)
  const inputPosition = useMemo(() => {
    const screenX = (createPosition.x - pan.x) * zoom;
    const screenY = (createPosition.y - pan.y - 10) * zoom;

    return { x: screenX, y: screenY };
  }, [createPosition, zoom, pan]);

  // textarea 크기 조절 함수
  const adjustSize = () => {
    if (textInputRef.current) {
      // 너비 조절 (가로로만 확장)
      textInputRef.current.style.width = "auto";
      const scrollWidth = textInputRef.current.scrollWidth;
      textInputRef.current.style.width = `${scrollWidth}px`;

      // 높이 조절 (세로로 자동 확장)
      textInputRef.current.style.height = "auto";
      const scrollHeight = textInputRef.current.scrollHeight;
      textInputRef.current.style.height = `${scrollHeight}px`;
    }
  };

  // 포커스 설정 및 초기 크기 조절 (DOM 업데이트 후)
  useEffect(() => {
    if (!inputPosition) return;

    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        adjustSize();
      }
    }, 0);
  }, [inputPosition]);

  // inputValue 변경 시 크기 조절
  useEffect(() => {
    adjustSize();
  }, [inputValue]);

  // 실제 텍스트 시작 위치 계산 및 finish 처리
  const handleFinish = () => {
    // 실제 텍스트 시작 위치 계산 (textarea의 border와 padding 고려)
    const paddingTop = -6.5;
    const paddingLeft = 0.5;

    const paddingOffsetX = paddingLeft / zoom;
    const paddingOffsetY = paddingTop / zoom;

    const actualPosition: Point = {
      x: createPosition.x + paddingOffsetX,
      y: createPosition.y + paddingOffsetY,
    };

    onFinish(inputValue, actualPosition, zoom);
    setInputValue("");
  };

  return (
    <StyledTextInput
      ref={textInputRef}
      $x={inputPosition.x}
      $y={inputPosition.y}
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
