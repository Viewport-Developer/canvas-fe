import { useRef, useEffect, useMemo } from "react";
import styled from "styled-components";
import ToolBar from "./components/ToolBar";
import Canvas from "./components/Canvas";
import { useYjsConnection } from "./hooks/useYjsConnection";
import { bindYjsToZustand } from "./store/yjsBindings";

const Container = styled.main`
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 환경변수에서 설정 가져오기
  const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:1234";

  // URL 쿼리 파라미터에서 canvasId 가져오기, 없으면 새로 생성
  const canvasId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('canvasId');
    
    if (idFromUrl) {
      // URL에 canvasId가 있으면 사용 (앞에 'canvas-' 접두사가 없으면 추가)
      return idFromUrl.startsWith('canvas-') ? idFromUrl : `canvas-${idFromUrl}`;
    }
    
    // 없으면 새로 생성하고 URL 업데이트
    const newId = `canvas-${crypto.randomUUID()}`;
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('canvasId', newId);
    window.history.replaceState({}, '', newUrl);
    
    return newId;
  }, []);

  // y.js 연결 설정
  const { yjsData, connectionState, updateCursorPosition, remoteCursors } = useYjsConnection(canvasId, wsUrl);

  // y.js와 Zustand 바인딩 초기화
  useEffect(() => {
    if (!yjsData) return;

    const cleanup = bindYjsToZustand(yjsData);

    return cleanup;
  }, [yjsData]);

  return (
    <Container ref={containerRef}>
      {connectionState.error && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "red", color: "white", padding: "8px", zIndex: 10000 }}>
          연결 오류: {connectionState.error.message}
        </div>
      )}
      {connectionState.connecting && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "orange", color: "white", padding: "8px", zIndex: 10000 }}>
          연결 중...
        </div>
      )}
      {connectionState.connected && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "green", color: "white", padding: "8px", zIndex: 10000, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>연결됨</span>
          <span style={{ fontSize: "12px", opacity: 0.9 }}>
            캔버스 ID: {canvasId}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('URL이 클립보드에 복사되었습니다!');
              }}
              style={{
                marginLeft: "8px",
                padding: "2px 8px",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
                fontSize: "11px"
              }}
            >
              URL 복사
            </button>
          </span>
        </div>
      )}
      <ToolBar />
      <Canvas 
        containerRef={containerRef} 
        updateCursorPosition={updateCursorPosition}
        remoteCursors={remoteCursors}
      />
    </Container>
  );
};

export default App;
