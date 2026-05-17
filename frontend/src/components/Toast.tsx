import { useEffect } from "react";

type Props = {
  message: string | null;
  onDismiss: () => void;
};

const AUTO_DISMISS_MS = 4000;

export function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    if (message === null) return;
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (message === null) return null;

  return (
    <div className="toast" role="alert" aria-live="assertive">
      <span className="toast-dot" aria-hidden="true" />
      <span className="toast-message">{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
