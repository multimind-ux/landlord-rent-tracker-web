import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/Input";

export default function PasswordInput({ id, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      id={id}
      type={visible ? "text" : "password"}
      right={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="rounded-lg p-1.5 text-muted transition hover:bg-elevated hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={id}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      }
      {...props}
    />
  );
}
