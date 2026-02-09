// 연속된 3점 (x0,y0)-(x1,y1)-(x2,y2) 사이의 베지어 제어점을 계산합니다.
export function getControlPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number
): [number, number, number, number] {
  const d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  const d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const fa = (t * d01) / (d01 + d12);
  const fb = (t * d12) / (d01 + d12);
  const p1x = x1 - fa * (x2 - x0);
  const p1y = y1 - fa * (y2 - y0);
  const p2x = x1 + fb * (x2 - x0);
  const p2y = y1 + fb * (y2 - y0);
  return [p1x, p1y, p2x, p2y];
}

// points 평면 배열과 tension으로 곡선용 제어점 배열을 만듭니다.
export function expandPoints(p: number[], tension: number): number[] {
  const len = p.length;
  const allPoints: number[] = [];

  for (let n = 2; n < len - 2; n += 2) {
    const cp = getControlPoints(p[n - 2], p[n - 1], p[n], p[n + 1], p[n + 2], p[n + 3], tension);
    if (isNaN(cp[0])) {
      continue;
    }
    allPoints.push(cp[0], cp[1], p[n], p[n + 1], cp[2], cp[3]);
  }

  return allPoints;
}
