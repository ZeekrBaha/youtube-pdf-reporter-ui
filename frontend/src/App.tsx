import { useState } from "react";

import { analyze } from "./api";
import type { Status } from "./types";
import { AnalyzeForm } from "./components/AnalyzeForm";
import { Spinner } from "./components/Spinner";
import { ResultCard } from "./components/ResultCard";
import { ErrorBanner } from "./components/ErrorBanner";

export default function App() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(url: string) {
    setStatus({ kind: "loading", url });
    try {
      const data = await analyze(url);
      setStatus({ kind: "success", data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      setStatus({ kind: "error", message });
    }
  }

  function reset() {
    setStatus({ kind: "idle" });
  }

  return (
    <main>
      <h1>YouTube PDF Reporter</h1>
      <AnalyzeForm
        onSubmit={handleSubmit}
        disabled={status.kind === "loading"}
      />
      {status.kind === "loading" && <Spinner />}
      {status.kind === "error" && (
        <ErrorBanner message={status.message} onRetry={reset} />
      )}
      {status.kind === "success" && (
        <ResultCard data={status.data} onReset={reset} />
      )}
    </main>
  );
}
