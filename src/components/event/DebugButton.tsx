import React from "react";
import { Button } from "@/components/ui/button";

interface DebugButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

const DebugButton = ({
  onClick,
  children,
  className = "",
  variant = "default",
}: DebugButtonProps) => {
  console.log("DebugButton rendered");

  const handleClick = (e: React.MouseEvent) => {
    console.log("DebugButton clicked");
    onClick();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      className={className}
      variant={variant}
    >
      {children}
    </Button>
  );
};

export default DebugButton;
