import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ShareAndRemindersProps {
  eventId: string;
}

export default function ShareAndReminders({
  eventId,
}: ShareAndRemindersProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const eventUrl = `${window.location.origin}/e/${eventId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setIsCopied(true);
      toast({
        title: language === "pt" ? "Link copiado!" : "Link copied!",
        description: language === "pt"
          ? "O link foi copiado para sua área de transferência"
          : "The link has been copied to your clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast({
        variant: "destructive",
        title: language === "pt" ? "Erro ao copiar" : "Copy error",
        description: language === "pt"
          ? "Não foi possível copiar o link"
          : "Could not copy the link",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-purple-700">
        {language === "pt" ? "Link Compartilhável" : "Shareable Link"}
      </h2>
      <div className="flex gap-2">
        <Input
          value={eventUrl}
          readOnly
          className="font-mono text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          className="shrink-0"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
} 