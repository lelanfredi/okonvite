import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export default function SendMessageDialog({
  open,
  onOpenChange,
  eventId,
}: SendMessageDialogProps) {
  const { language, t } = useI18n();
  const { toast } = useToast();
  const [recipients, setRecipients] = useState("all");
  const [channels, setChannels] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    email: 0,
    whatsapp: 0,
  });

  useEffect(() => {
    const fetchGuestStats = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from("event_rsvps")
          .select("id, email, phone, status")
          .eq("event_id", eventId);

        if (error) throw error;

        if (data) {
          const total = data.length;
          const email = data.filter((g) => g.email).length;
          const whatsapp = data.filter((g) => g.phone).length;

          setStats({
            total,
            email,
            whatsapp,
          });
        }
      } catch (error) {
        console.error("Error fetching guest stats:", error);
      }
    };

    fetchGuestStats();
  }, [eventId]);

  const handleSend = async () => {
    if (!channels.length) {
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description:
          language === "pt"
            ? "Selecione pelo menos um canal de envio"
            : "Select at least one sending channel",
        variant: "destructive",
      });
      return;
    }

    if (!message) {
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description:
          language === "pt" ? "Digite uma mensagem" : "Type a message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: guests } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .in(
          "status",
          recipients === "all"
            ? ["confirmed", "pending", "maybe"]
            : ["confirmed"],
        );

      if (!guests?.length) {
        toast({
          title: language === "pt" ? "Erro" : "Error",
          description:
            language === "pt"
              ? "Nenhum convidado encontrado"
              : "No guests found",
          variant: "destructive",
        });
        return;
      }

      // TODO: Implement actual message sending
      console.log("Sending message to:", {
        guests,
        channels,
        title,
        message,
      });

      toast({
        title: language === "pt" ? "Sucesso" : "Success",
        description:
          language === "pt"
            ? "Mensagem enviada com sucesso"
            : "Message sent successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description:
          language === "pt"
            ? "Erro ao enviar mensagem"
            : "Error sending message",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {language === "pt" ? "Enviar Comunicado" : "Send Announcement"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipients Selection */}
          <div className="space-y-4">
            <Label>{language === "pt" ? "Destinatários" : "Recipients"}</Label>
            <RadioGroup
              defaultValue="all"
              onValueChange={(value) => setRecipients(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">
                  {language === "pt" ? "Todos os convidados" : "All guests"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="confirmed" id="confirmed" />
                <Label htmlFor="confirmed">
                  {language === "pt" ? "Apenas confirmados" : "Only confirmed"}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Channels Selection */}
          <div className="space-y-4">
            <Label>
              {language === "pt" ? "Canais de envio" : "Sending channels"}
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={channels.includes("email")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setChannels([...channels, "email"]);
                    } else {
                      setChannels(channels.filter((c) => c !== "email"));
                    }
                  }}
                />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={channels.includes("whatsapp")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setChannels([...channels, "whatsapp"]);
                    } else {
                      setChannels(channels.filter((c) => c !== "whatsapp"));
                    }
                  }}
                />
                <Label htmlFor="whatsapp">WhatsApp</Label>
              </div>
            </div>
          </div>

          {/* Message Composition */}
          <div className="space-y-4">
            {channels.includes("email") && (
              <div className="space-y-2">
                <Label>
                  {language === "pt" ? "Título do email" : "Email title"}
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    language === "pt"
                      ? "Digite o título do email"
                      : "Enter email title"
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>{language === "pt" ? "Mensagem" : "Message"}</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  language === "pt"
                    ? "Digite sua mensagem..."
                    : "Type your message..."
                }
                className="min-h-[150px]"
              />
              <div className="text-xs text-muted-foreground text-right">
                {message.length}{" "}
                {language === "pt" ? "caracteres" : "characters"}
              </div>
            </div>
          </div>

          {/* Recipients Stats */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">
              {language === "pt" ? "Resumo do envio:" : "Sending summary:"}
            </p>
            <div className="text-sm text-muted-foreground">
              <p>
                {language === "pt"
                  ? "Total de destinatários"
                  : "Total recipients"}
                : {stats.total}
              </p>
              {channels.includes("email") && <p>Emails: {stats.email}</p>}
              {channels.includes("whatsapp") && (
                <p>WhatsApp: {stats.whatsapp}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === "pt" ? "Cancelar" : "Cancel"}
          </Button>
          <Button onClick={handleSend}>
            {language === "pt" ? "Enviar" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
