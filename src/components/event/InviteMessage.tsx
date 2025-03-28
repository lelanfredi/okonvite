import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteMessageProps {
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  onChange: (message: string) => void;
}

export default function InviteMessage({
  eventName,
  eventDate,
  eventLocation,
  onChange,
}: InviteMessageProps) {
  const { language } = useI18n();
  const [messageStyle, setMessageStyle] = useState<"formal" | "casual" | "fun">("formal");

  const getMessageSuggestions = (): string => {
    const formattedDate = new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(eventDate);

    const messages = {
      formal: {
        pt: `Temos o prazer de convidá-lo(a) para ${eventName}.\n\nData: ${formattedDate}\nLocal: ${eventLocation}\n\nFicaríamos honrados com sua presença.`,
        en: `We are pleased to invite you to ${eventName}.\n\nDate: ${formattedDate}\nLocation: ${eventLocation}\n\nWe would be honored by your presence.`,
      },
      casual: {
        pt: `Ei! Estamos organizando ${eventName} e queremos você lá!\n\nVai rolar dia ${formattedDate}\nLocal: ${eventLocation}\n\nNão deixe de comparecer!`,
        en: `Hey! We're organizing ${eventName} and want you there!\n\nIt's happening on ${formattedDate}\nLocation: ${eventLocation}\n\nDon't miss it!`,
      },
      fun: {
        pt: `🎉 Prepare-se para uma celebração incrível! 🎉\n\n${eventName} está chegando!\n\n📅 ${formattedDate}\n📍 ${eventLocation}\n\nVai ser demais ter você com a gente! 🤩`,
        en: `🎉 Get ready for an amazing celebration! 🎉\n\n${eventName} is coming!\n\n📅 ${formattedDate}\n📍 ${eventLocation}\n\nIt'll be awesome to have you with us! 🤩`,
      },
    };

    return messages[messageStyle][language === "pt" ? "pt" : "en"];
  };

  const handleStyleChange = (style: "formal" | "casual" | "fun") => {
    setMessageStyle(style);
    onChange(getMessageSuggestions());
  };

  const handleGetSuggestion = () => {
    onChange(getMessageSuggestions());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-purple-700">
          {language === "pt" ? "Mensagem de Convite" : "Invite Message"}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGetSuggestion}
          className="flex items-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          {language === "pt" ? "Obter Sugestões" : "Get Suggestions"}
        </Button>
      </div>

      <Select value={messageStyle} onValueChange={handleStyleChange}>
        <SelectTrigger>
          <SelectValue placeholder={language === "pt" ? "Escolha o estilo" : "Choose style"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="formal">
            {language === "pt" ? "Formal: 'Temos o prazer de convidá-lo...'" : "Formal: 'We are pleased to invite you...'"}
          </SelectItem>
          <SelectItem value="casual">
            {language === "pt" ? "Casual: 'Ei! Estamos organizando...'" : "Casual: 'Hey! We're organizing...'"}
          </SelectItem>
          <SelectItem value="fun">
            {language === "pt" ? "Divertido: 'Prepare-se para uma celebração...'" : "Fun: 'Get ready for a celebration...'"}
          </SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        className="min-h-[150px]"
        placeholder={
          language === "pt"
            ? "Digite sua mensagem de convite personalizada..."
            : "Type your custom invitation message..."
        }
        value={getMessageSuggestions()}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
} 