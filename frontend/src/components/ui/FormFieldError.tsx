import { AlertCircle } from "lucide-react";

interface FormFieldErrorProps {
  message?: string;
  className?: string;
}

export function FormFieldError({ message, className = "" }: FormFieldErrorProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-1.5 mt-1.5 text-xs text-destructive font-medium animate-fade-in text-right ${className}`} dir="rtl">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
