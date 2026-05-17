export type AnalyzeResponse = {
  video_id: string;
  video_url: string;
  summary: string;
  main_topics: string[];
  pdf_url: string;
  pdf_filename: string;
};

export type Status =
  | { kind: "idle" }
  | { kind: "loading"; url: string }
  | { kind: "success"; data: AnalyzeResponse };
