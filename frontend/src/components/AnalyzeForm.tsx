import { FormEvent, useState } from "react";

type Props = {
  onSubmit: (url: string) => void;
  disabled: boolean;
};

function looksLikeYouTubeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.includes("youtube.com") || trimmed.includes("youtu.be");
}

export function AnalyzeForm({ onSubmit, disabled }: Props) {
  const [url, setUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!looksLikeYouTubeUrl(url)) return;
    onSubmit(url.trim());
  }

  const canSubmit = !disabled && looksLikeYouTubeUrl(url);

  return (
    <form onSubmit={handleSubmit} className="row" aria-label="analyze-form">
      <input
        type="text"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        disabled={disabled}
        aria-label="youtube-url"
      />
      <button type="submit" disabled={!canSubmit}>
        Analyze
      </button>
    </form>
  );
}
