import { useRef, useEffect } from "react";
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
  const canvasId = import.meta.env.VITE_CANVAS_ID || "default-canvas";

  // y.js 연결 설정
  const { yjsData, connectionState } = useYjsConnection(canvasId, wsUrl);

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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "green", color: "white", padding: "8px", zIndex: 10000 }}>
          연결됨
        </div>
      )}
      <ToolBar />
      <Canvas containerRef={containerRef} />
    </Container>
  );
};

export default App;
