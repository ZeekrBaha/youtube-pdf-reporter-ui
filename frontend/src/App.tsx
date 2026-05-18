import { useState } from "react";

import { analyze, HttpError } from "./api";
import type { Status } from "./types";
import { AnalyzeForm, looksLikeYouTubeUrl } from "./components/AnalyzeForm";
import { Spinner } from "./components/Spinner";
import { ResultCard } from "./components/ResultCard";
import { Toast } from "./components/Toast";

export default function App() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    if (!looksLikeYouTubeUrl(url)) {
      setToast("That doesn't look like a YouTube link.");
      return;
    }

    setStatus({ kind: "loading", url });
    try {
      const data = await analyze(url);
      setStatus({ kind: "success", data });
    } catch (error) {
      setStatus({ kind: "idle" });
      setToast(messageForError(error));
      if (error instanceof HttpError && error.status === 500) {
        console.error("Internal error from /api/analyze:", error);
      }
    }
  }

  function reset() {
    setStatus({ kind: "idle" });
  }

  return (
    <>
      <Toast message={toast} onDismiss={() => setToast(null)} />
      <main>
        <header className="brand">
          <span className="brand-mark" aria-hidden="true">▶</span>
          <span className="brand-wordmark">YouTube → PDF</span>
        </header>

        <AnalyzeForm
          onSubmit={handleSubmit}
          disabled={status.kind === "loading"}
        />
        {status.kind === "loading" && <Spinner />}
        {status.kind === "success" && (
          <ResultCard data={status.data} onReset={reset} />
        )}
      </main>
    </>
  );
}

function messageForError(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 400) {
      return "That YouTube link isn't supported. Try a normal video URL.";
    }
    if (error.status === 502) {
      return "We couldn't get a transcript for this video. Try a different one.";
    }
    if (error.status === 500) {
      return "Something went wrong on our end. Please try again.";
    }
  }
  if (error instanceof TypeError) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
