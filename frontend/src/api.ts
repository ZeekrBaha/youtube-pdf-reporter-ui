import type { AnalyzeResponse } from "./types";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

export async function analyze(youtubeUrl: string): Promise<AnalyzeResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ youtube_url: youtubeUrl }),
  });

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new HttpError(
      response.status,
      detail ?? "Something went wrong while analyzing the video.",
    );
  }

  return (await response.json()) as AnalyzeResponse;
}
