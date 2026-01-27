import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { RemoteCursor } from '../hooks/useYjsConnection';

const CursorLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`;

const RemoteCursor = styled.div<{ $x: number; $y: number; $color: string }>`
  position: absolute;
  left: ${(props) => props.$x}px;
  top: ${(props) => props.$y}px;
  width: 0;
  height: 0;
  pointer-events: none;
  transform: translate(-50%, -50%);
  
  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: -12px;
    width: 20px;
    height: 20px;
    border: 2px solid ${(props) => props.$color};
    border-radius: 50%;
    background: ${(props) => props.$color};
    opacity: 0.3;
  }
  
  &::after {
    content: '';
    position: absolute;
    left: -2px;
    top: -2px;
    width: 4px;
    height: 4px;
    background: ${(props) => props.$color};
    border-radius: 50%;
  }
`;

interface RemoteCursorsProps {
  remoteCursors: Map<number, RemoteCursor>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  zoom: number;
  pan: { x: number; y: number };
}

const RemoteCursors = ({ remoteCursors, canvasRef, zoom, pan }: RemoteCursorsProps) => {
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [canvasRef, zoom, pan]);

  const remoteCursorPositions = useMemo(() => {
    if (!canvasRect) return [];

    return Array.from(remoteCursors.values())
      .filter((cursor) => cursor.position !== null)
      .map((cursor) => {
        // 캔버스 좌표를 화면 좌표로 변환
        const screenX = (cursor.position!.x - pan.x) * zoom + canvasRect.left;
        const screenY = (cursor.position!.y - pan.y) * zoom + canvasRect.top;

        return {
          ...cursor,
          screenX,
          screenY,
        };
      });
  }, [remoteCursors, zoom, pan, canvasRect]);

  return (
    <CursorLayer>
      {remoteCursorPositions.map((cursor) => (
        <RemoteCursor
          key={cursor.clientId}
          $x={cursor.screenX}
          $y={cursor.screenY}
          $color={cursor.color}
        />
      ))}
    </CursorLayer>
  );
};

export default RemoteCursors;
