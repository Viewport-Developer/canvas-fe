// 캔버스 관련 타입 통합
// 하위 호환성을 위해 모든 타입을 re-export합니다.

export * from "./common.types";
export * from "./path.types";
export * from "./shape.types";
export * from "./history.types";

import type { DrawAction } from "./path.types";
import type { ShapeAction } from "./shape.types";
import type { EraseAction, PanAction } from "./history.types";

// 모든 히스토리 액션의 유니온 타입
export type HistoryAction = DrawAction | EraseAction | PanAction | ShapeAction;
