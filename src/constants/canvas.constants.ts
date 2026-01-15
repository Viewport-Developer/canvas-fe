export const CANVAS_CONFIG = {
  // 최소 줌 레벨
  MIN_ZOOM: 0.2,
  // 최대 줌 레벨
  MAX_ZOOM: 5,

  // 줌 인 증가 배율
  ZOOM_DELTA_IN: 1.2,
  // 줌 아웃 감소 배율
  ZOOM_DELTA_OUT: 0.8,

  // 그리기 스로틀 시간 (ms)
  DRAW_THROTTLE_MS: 16,
  // 최소 포인트 간 거리
  MIN_POINT_DISTANCE: 2,

  // 지우개 반경
  ERASER_RADIUS: 24,

  // 히스토리 스택 최대 크기
  MAX_STACK_SIZE: 50,

  // 선택 박스 패딩 비율 (바운딩 박스 크기의 %)
  SELECTION_BOX_PADDING_RATIO: 0.05,
  // 리사이즈 핸들 반경
  RESIZE_HANDLE_RADIUS: 5,
  // 최소 리사이즈 크기
  MIN_RESIZE_SIZE: 1,

  // 선과 도형의 기본 색상
  DEFAULT_STROKE_COLOR: "#000000",
  // 선과 도형의 기본 두께
  DEFAULT_STROKE_WIDTH: 2,

  // 바운딩 박스 색상
  SELECTION_BOX_COLOR: "#5B57D1",
  // 바운딩 박스 선 두께
  SELECTION_BOX_LINE_WIDTH: 1,
  // 바운딩 박스 핸들 색상
  SELECTION_BOX_HANDLE_COLOR: "#5B57D1",

  // 지워질 요소 표시용 투명도
  ERASE_PREVIEW_ALPHA: 0.3,

  // 텍스트 기본 색상
  DEFAULT_TEXT_COLOR: "#000000",
  // 텍스트 기본 폰트 사이즈
  DEFAULT_TEXT_FONT_SIZE: 16,
  // 텍스트 줄 간격 오프셋
  DEFAULT_TEXT_LINE_HEIGHT_OFFSET: 4,
} as const;
