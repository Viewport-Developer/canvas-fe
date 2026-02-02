import type { BoundingBox, ResizeHandleType } from "./common.types";
import type { Path } from "./path.types";
import type { Shape } from "./shape.types";
import type { Text } from "./text.types";

export type ResizeSelected = {
  type: "path" | "shape" | "text";
  newBoundingBox: BoundingBox;
  initialBoundingBox: BoundingBox;
  initialItems: Path[] | Shape[] | Text[];
  resizeHandle?: ResizeHandleType;
};
