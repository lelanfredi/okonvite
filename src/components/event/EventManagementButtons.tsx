import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Share2, Settings } from "lucide-react";

interface EventManagementButtonsProps {
  onInviteGuests?: () => void;
  onSendMessage?: () => void;
  onShare?: () => void;
  onManage?: () => void;
}

export function EventManagementButtons({
  onInviteGuests,
  onSendMessage,
  onShare,
  onManage,
}: EventManagementButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Button
        onClick={onInviteGuests}
        variant="default"
        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
      >
        <MessageSquare className="h-5 w-5" />
        Convidar Convidados
      </Button>

      <Button
        onClick={onSendMessage}
        variant="outline"
        className="border-purple-200 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
      >
        <Send className="h-5 w-5" />
        Enviar Comunicado
      </Button>

      <Button
        onClick={onShare}
        variant="outline"
        className="border-purple-200 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
      >
        <Share2 className="h-5 w-5" />
        Compartilhar Evento
      </Button>

      <Button
        onClick={onManage}
        variant="outline"
        className="border-purple-200 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
      >
        <Settings className="h-5 w-5" />
        Gerenciar evento
      </Button>
    </div>
  );
} 