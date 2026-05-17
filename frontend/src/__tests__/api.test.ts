import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { analyze, HttpError } from "../api";

describe("analyze", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns parsed payload on 200", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        video_id: "abc",
        video_url: "https://www.youtube.com/watch?v=abc",
        summary: "s",
        main_topics: ["t"],
        pdf_url: "/pdfs/x.pdf",
        pdf_filename: "x.pdf",
      }),
    });

    const result = await analyze("https://www.youtube.com/watch?v=abc");

    expect(result.video_id).toBe("abc");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/analyze",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: "https://www.youtube.com/watch?v=abc" }),
      }),
    );
  });

  it("throws HttpError carrying status and server detail on non-2xx", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ detail: "Unsupported YouTube URL" }),
    });

    try {
      await analyze("https://example.com");
      throw new Error("expected analyze to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(400);
      expect((error as HttpError).message).toBe("Unsupported YouTube URL");
    }
  });

  it("throws HttpError with status and generic message when body has no detail", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    try {
      await analyze("https://example.com");
      throw new Error("expected analyze to reject");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(500);
      expect((error as HttpError).message).toMatch(/something went wrong/i);
    }
  });
});
