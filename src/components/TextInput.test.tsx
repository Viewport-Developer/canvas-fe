import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextInput from "./TextInput";

describe("TextInput", () => {
  it("초기 content로 textarea를 렌더링한다", () => {
    const onFinish = vi.fn();
    render(
      <TextInput
        createPosition={{ x: 0, y: 0 }}
        zoom={1}
        pan={{ x: 0, y: 0 }}
        onFinish={onFinish}
        initialContent="hello"
      />
    );
    const textbox = screen.getByRole("textbox");
    expect(textbox).toHaveValue("hello");
  });

  it("입력 후 blur 시 onFinish가 content와 position으로 호출된다", async () => {
    const onFinish = vi.fn();
    render(
      <TextInput
        createPosition={{ x: 10, y: 20 }}
        zoom={1}
        pan={{ x: 0, y: 0 }}
        onFinish={onFinish}
      />
    );
    const textbox = screen.getByRole("textbox");
    await userEvent.type(textbox, "테스트");
    await userEvent.tab();
    expect(onFinish).toHaveBeenCalled();
    expect(onFinish.mock.calls[0][0]).toBe("테스트");
    expect(onFinish.mock.calls[0][2]).toBe(1);
  });

  it("Escape 키 시 onFinish가 호출된다", async () => {
    const onFinish = vi.fn();
    render(
      <TextInput
        createPosition={{ x: 0, y: 0 }}
        zoom={1}
        pan={{ x: 0, y: 0 }}
        onFinish={onFinish}
      />
    );
    await userEvent.type(screen.getByRole("textbox"), "x");
    await userEvent.keyboard("{Escape}");
    expect(onFinish).toHaveBeenCalled();
  });

  it("onChange가 있으면 입력 시 호출된다", async () => {
    const onChange = vi.fn();
    render(
      <TextInput
        createPosition={{ x: 0, y: 0 }}
        zoom={1}
        pan={{ x: 0, y: 0 }}
        onFinish={vi.fn()}
        onChange={onChange}
      />
    );
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });
});
