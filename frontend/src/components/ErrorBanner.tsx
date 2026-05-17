type Props = {
  message: string;
  onRetry: () => void;
};

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="error" role="alert">
      <p>{message}</p>
      <button onClick={onRetry}>Try again</button>
    </div>
  );
}
