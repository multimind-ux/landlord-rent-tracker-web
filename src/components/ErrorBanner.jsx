// Reusable error banner with an optional retry action.
export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="alert error" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn secondary small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
