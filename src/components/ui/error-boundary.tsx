import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-medium">Ocorreu um erro</h3>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            {this.state.error?.message || "Algo deu errado ao carregar as informações."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
} 