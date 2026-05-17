import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import App from "../App";

describe("App", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("idle → loading → success renders summary and topics", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        video_id: "abc",
        video_url: "https://www.youtube.com/watch?v=abc",
        summary: "It is a great video.",
        main_topics: ["alpha", "beta"],
        pdf_url: "/pdfs/x.pdf",
        pdf_filename: "x.pdf",
      }),
    });

    render(<App />);
    await userEvent.type(
      screen.getByLabelText("youtube-url"),
      "https://www.youtube.com/watch?v=abc",
    );
    await userEvent.click(screen.getByRole("button", { name: /analyze/i }));

    expect(await screen.findByText("It is a great video.")).toBeInTheDocument();
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /download pdf/i }),
    ).toHaveAttribute("href", "/pdfs/x.pdf");
  });

  it("idle → loading → error renders the server detail and retry resets", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Unsupported YouTube URL" }),
    });

    render(<App />);
    await userEvent.type(
      screen.getByLabelText("youtube-url"),
      "https://www.youtube.com/watch?v=bad",
    );
    await userEvent.click(screen.getByRole("button", { name: /analyze/i }));

    expect(
      await screen.findByText("Unsupported YouTube URL"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(screen.queryByText("Unsupported YouTube URL")).not.toBeInTheDocument();
  });

  it("submit button is disabled until URL looks valid", async () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /analyze/i });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText("youtube-url"), "hello");
    expect(button).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText("youtube-url"),
      " https://youtu.be/abc",
    );
    expect(button).toBeEnabled();
  });
});
