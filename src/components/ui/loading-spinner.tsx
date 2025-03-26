import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles, PartyPopper } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "party";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (variant === "party") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-ping opacity-75">
              <Sparkles className={cn(sizeClasses[size], "text-primary")} />
            </div>
          </div>
          <div className="animate-bounce">
            <PartyPopper className={cn(sizeClasses[size], "text-primary")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <svg
          className={cn("animate-spin", sizeClasses[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    </div>
  );
}
