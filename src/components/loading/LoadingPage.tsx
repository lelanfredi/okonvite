import React from "react";
import { ConfettiLoader } from "@/components/ui/confetti-loader";
import { useI18n } from "@/lib/i18n";

interface LoadingPageProps {
  message?: string;
}

export default function LoadingPage({ message }: LoadingPageProps) {
  const { language } = useI18n();
  const defaultMessage = "Carregando";
  const displayMessage = message || defaultMessage;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8 rounded-lg text-center">
        <ConfettiLoader message={displayMessage} className="mb-8" />

        <div className="mt-8 text-muted-foreground text-sm">
          {language === "pt" ? "Por favor, aguarde..." : "Please wait..."}
        </div>
      </div>
    </div>
  );
}
