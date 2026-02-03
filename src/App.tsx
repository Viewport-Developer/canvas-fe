import { useRef, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import styled from "styled-components";
import ToolBar from "./components/ToolBar";
import Canvas from "./components/Canvas";
import CopyLink from "./components/ConnectionStatus";
import { useYjsConnection } from "./hooks/useYjsConnection";
import { useYjsConnectionStore } from "./store/yjsStore";
import { bindYjsToZustand } from "./utils";

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
    const idFromUrl = params.get("canvasId");

    if (idFromUrl) {
      return idFromUrl;
    }

    const newId = `canvas-${crypto.randomUUID()}`;
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("canvasId", newId);
    window.history.replaceState({}, "", newUrl);

    return newId;
  }, []);

  // y.js 연결 설정
  useYjsConnection(canvasId, wsUrl);

  const [yjsData] = useYjsConnectionStore(useShallow((s) => [s.yjsData]));
  const [awareness] = useYjsConnectionStore(useShallow((s) => [s.awareness]));
  const hasBoundRef = useRef(false);

  // y.js와 Zustand 바인딩
  useEffect(() => {
    if (!yjsData || !awareness || hasBoundRef.current) {
      return;
    }

    hasBoundRef.current = true;
    const cleanup = bindYjsToZustand(yjsData, awareness);

    return () => {
      hasBoundRef.current = false;
      cleanup();
    };
  }, [yjsData, awareness]);

  return (
    <Container ref={containerRef}>
      <CopyLink />
      <ToolBar />
      <Canvas containerRef={containerRef} />
    </Container>
  );
};

export default App;
