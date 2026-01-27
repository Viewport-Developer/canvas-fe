import type { Path, Shape, Text } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * 캔버스의 도형 데이터를 서버에서 가져옵니다.
 */
export async function fetchCanvasShapes(canvasId: string): Promise<{
  paths: Path[];
  shapes: Shape[];
  texts: Text[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/shapes`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // 캔버스가 없으면 빈 데이터 반환
        return { paths: [], shapes: [], texts: [] };
      }
      throw new Error(`서버 오류: ${response.status}`);
    }
    
    const data = (await response.json()) as {
      paths?: Array<{
        id: string;
        points: unknown;
        color: string;
        width: number;
        boundingBox: unknown;
      }>;
      shapes?: Array<{
        id: string;
        type: string;
        startPoint: unknown;
        endPoint: unknown;
        color: string;
        width: number;
        boundingBox: unknown;
      }>;
      texts?: Array<{
        id: string;
        position: unknown;
        content: string;
        color: string;
        fontSize: number;
        boundingBox: unknown;
      }>;
    };
    
    // JSON 필드를 타입에 맞게 변환

    return {
      paths: (data.paths || []).map((path) => ({
        id: path.id,
        points: path.points as Path['points'],
        color: path.color,
        width: path.width,
        boundingBox: path.boundingBox as Path['boundingBox'],
      })),
      shapes: (data.shapes || []).map((shape) => ({
        id: shape.id,
        type: shape.type as Shape['type'],
        startPoint: shape.startPoint as Shape['startPoint'],
        endPoint: shape.endPoint as Shape['endPoint'],
        color: shape.color,
        width: shape.width,
        boundingBox: shape.boundingBox as Shape['boundingBox'],
      })),
      texts: (data.texts || []).map((text) => ({
        id: text.id,
        position: text.position as Text['position'],
        content: text.content,
        color: text.color,
        fontSize: text.fontSize,
        boundingBox: text.boundingBox as Text['boundingBox'],
      })),
    };
  } catch (error) {
    console.error('[API] 도형 데이터 가져오기 실패:', error);
    // 에러 발생 시 빈 데이터 반환
    return { paths: [], shapes: [], texts: [] };
  }
}

/**
 * 캔버스 메타데이터를 가져옵니다.
 */
export async function fetchCanvas(canvasId: string): Promise<{
  id: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
} | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`서버 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[API] 캔버스 메타데이터 가져오기 실패:', error);
    return null;
  }
}

/**
 * 새 캔버스를 생성합니다.
 */
export async function createCanvas(name?: string): Promise<{
  id: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/canvas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[API] 캔버스 생성 실패:', error);
    throw error;
  }
}

/**
 * 캔버스를 삭제합니다.
 */
export async function deleteCanvas(canvasId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }
  } catch (error) {
    console.error('[API] 캔버스 삭제 실패:', error);
    throw error;
  }
}
