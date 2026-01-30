import type { BoundingBox, ResizeHandleType } from "./common.types";
import type { Path } from "./path.types";
import type { Shape } from "./shape.types";
import type { Text } from "./text.types";

export type ResizeSelected = {
  type: "path" | "shape" | "text";
  newBoundingBox: BoundingBox;
  /** 결합 바운딩 박스 (단일 요소면 해당 요소의 바운딩 박스와 동일) */
  initialBoundingBox: BoundingBox;
  /** 리사이즈 시작 시점의 해당 타입 선택 요소들 (단일이면 길이 1) */
  initialItems: Path[] | Shape[] | Text[];
  resizeHandle?: ResizeHandleType;
};
