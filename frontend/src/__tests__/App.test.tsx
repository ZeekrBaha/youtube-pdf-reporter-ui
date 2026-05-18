import { render, screen, waitFor } from "@testing-library/react";
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

  it("idle → loading → success renders summary, topics, and download link", async () => {
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

  it("bad-URL submit shows toast, never calls the API", async () => {
    render(<App />);
    await userEvent.type(
      screen.getByLabelText("youtube-url"),
      "https://example.com/not-a-video",
    );
    await userEvent.click(screen.getByRole("button", { name: /analyze/i }));

    expect(
      await screen.findByText("That doesn't look like a YouTube link."),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submit button is enabled whenever the input is non-empty", async () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /analyze/i });

    // Empty input: disabled.
    expect(button).toBeDisabled();

    // Any non-empty input enables the button, even if it doesn't look like a YouTube URL.
    await userEvent.type(screen.getByLabelText("youtube-url"), "anything");
    expect(button).toBeEnabled();
  });

  it("server 400 shows mapped toast, clears spinner, re-enables the form", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Unsupported YouTube URL: x" }),
    });

    render(<App />);
    await userEvent.type(
      screen.getByLabelText("youtube-url"),
      "https://www.youtube.com/something-not-a-video",
    );
    await userEvent.click(screen.getByRole("button", { name: /analyze/i }));

    expect(
      await screen.findByText(
        "That YouTube link isn't supported. Try a normal video URL.",
      ),
    ).toBeInTheDocument();

    // Spinner gone, form usable.
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText("youtube-url")).toBeEnabled();
    expect(screen.getByRole("button", { name: /analyze/i })).toBeEnabled();
  });
});
