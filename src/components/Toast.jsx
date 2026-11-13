import { useEffect } from "react";

// Small auto-dismissing notification used for form success/failure feedback.
export default function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast ${type}`}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span>{message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
