import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MessageSquare, Share2, Copy, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface InviteMethodsProps {
  eventId: string;
  guests: Array<{ name: string; email?: string; phone?: string }>;
  inviteMessage: string;
}

export default function InviteMethods({ eventId, guests, inviteMessage }: InviteMethodsProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  
  const eventUrl = `${window.location.origin}/e/${eventId}`;

  const handleEmailInvites = async () => {
    const emailGuests = guests.filter(guest => guest.email);
    if (emailGuests.length === 0) {
      toast({
        variant: "destructive",
        title: language === "pt" ? "Nenhum email encontrado" : "No emails found",
        description: language === "pt" 
          ? "Adicione emails aos convidados primeiro" 
          : "Add emails to guests first"
      });
      return;
    }

    // Aqui você pode integrar com seu serviço de email
    toast({
      title: language === "pt" ? "Enviando convites" : "Sending invites",
      description: language === "pt"
        ? `Enviando ${emailGuests.length} convites por email...`
        : `Sending ${emailGuests.length} email invites...`
    });
  };

  const handleWhatsAppInvites = () => {
    const whatsappGuests = guests.filter(guest => guest.phone);
    if (whatsappGuests.length === 0) {
      toast({
        variant: "destructive",
        title: language === "pt" ? "Nenhum telefone encontrado" : "No phones found",
        description: language === "pt"
          ? "Adicione números de telefone aos convidados primeiro"
          : "Add phone numbers to guests first"
      });
      return;
    }

    // Abre o WhatsApp Web com a mensagem
    const message = encodeURIComponent(`${inviteMessage}\n\n${eventUrl}`);
    window.open(`https://web.whatsapp.com/send?text=${message}`, "_blank");
  };

  const handleShareLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: language === "pt" ? "Convite para evento" : "Event invitation",
          text: inviteMessage,
          url: eventUrl
        });
      } else {
        await navigator.clipboard.writeText(eventUrl);
        setIsCopied(true);
        toast({
          title: language === "pt" ? "Link copiado!" : "Link copied!",
          description: language === "pt"
            ? "O link foi copiado para sua área de transferência"
            : "The link has been copied to your clipboard"
        });
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-purple-700">
        {language === "pt" ? "Métodos de Convite" : "Invite Methods"}
      </h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          onClick={handleEmailInvites}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          <Mail className="w-5 h-5" />
          {language === "pt" ? "Convites por Email" : "Email Invites"}
        </Button>

        <Button
          onClick={handleWhatsAppInvites}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          <MessageSquare className="w-5 h-5" />
          {language === "pt" ? "Convites por WhatsApp" : "WhatsApp Invites"}
        </Button>

        <Button
          onClick={handleShareLink}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {isCopied ? (
            <Check className="w-5 h-5" />
          ) : navigator.share ? (
            <Share2 className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
          {language === "pt" ? "Compartilhar Link" : "Share Link"}
        </Button>
      </div>
    </div>
  );
} 