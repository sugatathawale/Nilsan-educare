import { Loader2 } from "lucide-react";

type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
};

export function LoadingSpinner({
  label = "Loading…",
  size = "md"
}: LoadingSpinnerProps) {
  const iconSize = size === "sm" ? 18 : size === "lg" ? 32 : 24;

  return (
    <div className={`learn-loading learn-loading--${size}`} role="status">
      <Loader2 className="learn-loading__icon" size={iconSize} aria-hidden />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
