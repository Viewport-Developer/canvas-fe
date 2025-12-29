import { useRef } from "react";
import styled from "styled-components";
import ToolBar from "./components/ToolBar";
import Canvas from "./components/Canvas";

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Container ref={containerRef}>
      <ToolBar></ToolBar>
      <Canvas></Canvas>
    </Container>
  );
}

export default App;
