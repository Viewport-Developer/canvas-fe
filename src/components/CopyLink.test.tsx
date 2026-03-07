import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyLink from "./CopyLink";

describe("CopyLink", () => {
  it("URL 복사 버튼을 렌더링한다", () => {
    render(<CopyLink />);
    expect(screen.getByRole("button", { name: /url 복사/i })).toBeInTheDocument();
  });

  it("클릭 시 클립보드에 현재 URL을 복사한다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CopyLink />);
    await userEvent.click(screen.getByRole("button", { name: /url 복사/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });
});
