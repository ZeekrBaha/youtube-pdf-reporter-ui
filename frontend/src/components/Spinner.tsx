export function Spinner() {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner-ring" aria-hidden="true" />
      <div className="spinner-label">Analyzing video</div>
      <div className="spinner-sub">this can take a minute or two</div>
    </div>
  );
}
