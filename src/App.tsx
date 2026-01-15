import { useRef } from "react";
import styled from "styled-components";
import ToolBar from "./components/ToolBar";
import Canvas from "./components/Canvas";

const Container = styled.main`
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Container ref={containerRef}>
      <ToolBar />
      <Canvas containerRef={containerRef} />
    </Container>
  );
};

export default App;
