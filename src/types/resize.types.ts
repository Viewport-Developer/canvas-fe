import type { BoundingBox, ResizeHandleType } from "./common.types";
import type { Path } from "./path.types";
import type { Shape } from "./shape.types";
import type { Text } from "./text.types";

export type ResizeSelected = {
  newBoundingBox: BoundingBox;
  initialBoundingBox: BoundingBox;
  initialPaths: Path[];
  initialShapes: Shape[];
  initialTexts: Text[];
  resizeHandle?: ResizeHandleType;
};
