import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface ConfettiLoaderProps {
  message?: string;
  className?: string;
}

export function ConfettiLoader({ message, className }: ConfettiLoaderProps) {
  const [dots, setDots] = useState(0);
  const defaultMessage = "Carregando";
  const displayMessage = message || defaultMessage;

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative w-24 h-24 mb-6">
        {/* Confetti circles with animation */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-4 h-4 rounded-full",
              "animate-bounce",
              i % 4 === 0 ? "bg-primary" : "",
              i % 4 === 1 ? "bg-secondary" : "",
              i % 4 === 2 ? "bg-accent" : "",
              i % 4 === 3 ? "bg-muted" : "",
              i === 0 && "top-0 left-10",
              i === 1 && "top-4 left-4",
              i === 2 && "top-10 left-0",
              i === 3 && "top-16 left-4",
              i === 4 && "top-20 left-10",
              i === 5 && "top-16 left-16",
              i === 6 && "top-10 left-20",
              i === 7 && "top-4 left-16",
              `animation-delay-${i * 125}`,
            )}
            style={{ animationDelay: `${i * 0.125}s` }}
          />
        ))}
      </div>
      <p className="text-xl font-medium text-center">
        {displayMessage}
        {".".repeat(dots)}
      </p>
    </div>
  );
}
