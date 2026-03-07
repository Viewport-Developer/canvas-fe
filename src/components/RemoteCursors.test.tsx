import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { useRef } from "react";
import RemoteCursors from "./RemoteCursors";
import { useYjsConnectionStore } from "../store/yjsStore";

const Wrapper = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={canvasRef} data-testid="canvas" style={{ width: 200, height: 200 }} />
      <RemoteCursors canvasRef={canvasRef as React.RefObject<HTMLCanvasElement | null>} zoom={1} pan={{ x: 0, y: 0 }} />
    </div>
  );
};

describe("RemoteCursors", () => {
  beforeEach(() => {
    useYjsConnectionStore.getState().setRemoteCursors(new Map());
  });

  it("remoteCursors가 비어 있으면 커서를 렌더하지 않는다", () => {
    const { container } = render(<Wrapper />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    const layer = wrapper.lastChild as HTMLElement;
    expect(layer?.childNodes.length).toBe(0);
  });

  it("remoteCursors에 항목이 있으면 해당 수만큼 렌더한다", () => {
    useYjsConnectionStore.getState().setRemoteCursors(
      new Map([
        [1, { position: { x: 50, y: 50 }, color: "#2196f3" }],
        [2, { position: { x: 100, y: 100 }, color: "#9c27b0" }],
      ])
    );
    const { container } = render(<Wrapper />);
    const layer = (container.firstChild as HTMLElement)?.lastChild as HTMLElement;
    expect(layer?.childNodes.length).toBe(2);
  });

  it("position이 null인 커서는 렌더하지 않는다", () => {
    useYjsConnectionStore.getState().setRemoteCursors(
      new Map([[1, { position: null, color: "#2196f3" }]])
    );
    const { container } = render(<Wrapper />);
    const layer = (container.firstChild as HTMLElement)?.lastChild as HTMLElement;
    expect(layer?.childNodes.length).toBe(0);
  });
});
