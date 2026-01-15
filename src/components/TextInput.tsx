import { useRef, useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import type { Point } from "../types";
import { CANVAS_CONFIG } from "../constants/canvas.constants";

type TextInputProps = {
  createPosition: Point;
  editingTextId?: string | null;
  initialContent?: string;
  fontSize?: number;
  zoom: number;
  pan: Point;
  onFinish: (content: string, actualPosition: Point, zoom: number) => void;
};

const StyledTextInput = styled.textarea<{ $x: number; $y: number; $fontSize: number; $zoom: number }>`
  position: absolute;
  top: ${(props) => props.$y}px;
  left: ${(props) => props.$x}px;
  border: 1px solid #5b57d1;
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

const TextInput = ({
  createPosition,
  editingTextId,
  initialContent = "",
  fontSize,
  zoom,
  pan,
  onFinish,
}: TextInputProps) => {
  // 편집 모드일 때는 초기값을 설정하고, 생성 모드일 때는 빈 문자열
  // key prop으로 재마운트되므로 초기값만 설정하면 됨
  const [inputValue, setInputValue] = useState(initialContent);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // 캔버스 좌표를 화면 좌표로 변환 (컨테이너 기준)
  // 편집 모드일 때는 기존 텍스트 위치에 맞춰야 하므로 오프셋 조정
  const inputPosition = useMemo(() => {
    // 실제 텍스트 시작 위치 계산 (textarea의 border와 padding 고려)
    const paddingTop = 9;
    const paddingLeft = 0.5;

    const paddingOffsetX = paddingLeft / zoom;
    const paddingOffsetY = paddingTop / zoom;

    let adjustedX: number;
    let adjustedY: number;

    if (editingTextId) {
      // 편집 모드: 기존 텍스트의 position은 이미 오프셋이 적용된 상태이므로
      // 입력 필드를 배치할 때는 오프셋을 빼서 textarea의 실제 위치에 맞춤
      adjustedX = createPosition.x - 0.5;
      adjustedY = createPosition.y - 4;
    } else {
      // 생성 모드: 클릭한 위치 그대로 사용
      adjustedX = createPosition.x - paddingOffsetX;
      adjustedY = createPosition.y - paddingOffsetY;
    }

    const screenX = (adjustedX - pan.x) * zoom;
    const screenY = (adjustedY - pan.y) * zoom;

    return { x: screenX, y: screenY };
  }, [createPosition, zoom, pan, editingTextId]);

  // textarea 크기 조절 함수
  const adjustSize = () => {
    if (textInputRef.current) {
      // 너비 조절 (가로로만 확장)
      textInputRef.current.style.width = "auto";
      const scrollWidth = textInputRef.current.scrollWidth;
      textInputRef.current.style.width = `${scrollWidth + 4}px`;

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
    const paddingTop = -5;
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
