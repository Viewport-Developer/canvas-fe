/** 통합 테스트용 공통 픽스처 */
export const makeBox = (x: number, y: number, w: number, h: number) => ({
  topLeft: { x, y },
  topRight: { x: x + w, y },
  bottomLeft: { x, y: y + h },
  bottomRight: { x: x + w, y: y + h },
});

export const makePath = (id: string, points: { x: number; y: number }[] = [{ x: 0, y: 0 }]) => ({
  id,
  points,
  color: "#000",
  width: 2,
  boundingBox: makeBox(0, 0, 10, 10),
});

export const makeShape = (id: string) => ({
  id,
  type: "rectangle" as const,
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 10, y: 10 },
  color: "#000",
  width: 2,
  boundingBox: makeBox(0, 0, 10, 10),
});

export const makeText = (id: string, content = "hi") => ({
  id,
  position: { x: 0, y: 0 },
  content,
  color: "#000",
  fontSize: 16,
  boundingBox: makeBox(0, 0, 10, 16),
});
