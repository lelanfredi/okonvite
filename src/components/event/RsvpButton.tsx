import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface RsvpButtonProps {
  onClick: () => void;
}

export default function RsvpButton({ onClick }: RsvpButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      size="lg"
    >
      <Check className="h-5 w-5 mr-2" />
      Confirmar Presença
    </Button>
  );
} 