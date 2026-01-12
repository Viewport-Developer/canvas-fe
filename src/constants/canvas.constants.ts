// 캔버스 설정 상수
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
} as const;
