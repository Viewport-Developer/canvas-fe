export * from "./common.types";
export * from "./path.types";
export * from "./shape.types";
export * from "./history.types";

import type { EraseAction, PanAction, ResizeAction, DrawAction, ShapeAction } from "./history.types";

// 모든 히스토리 액션의 유니온 타입
export type HistoryAction = DrawAction | EraseAction | PanAction | ShapeAction | ResizeAction;
