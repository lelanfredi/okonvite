import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, MessageSquare, Mail, Calendar } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShareInvitesProps {
  eventId: string;
  saveTheDate: {
    message: string;
  };
  eventDetails?: {
    title: string;
    date: string;
    location: string;
  };
  onShare?: (method: string, type: "save-the-date" | "invitation") => void;
}

export default function ShareInvites({
  eventId,
  saveTheDate,
  eventDetails = {
    title: "Meu Evento",
    date: "Em breve",
    location: "Local a confirmar",
  },
  onShare = () => {},
}: ShareInvitesProps) {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState<"save-the-date" | "invitation">(
    "save-the-date",
  );

  const eventLink = `${window.location.origin}/evento/${eventId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    let message = "";

    if (shareType === "save-the-date") {
      message = `${saveTheDate.message}\n\nAcesse o evento aqui: ${eventLink}`;
    } else {
      message = `Você está convidado para ${eventDetails.title}!\n\nData: ${eventDetails.date}\nLocal: ${eventDetails.location}\n\nAcesse o evento aqui: ${eventLink}`;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    onShare("whatsapp", shareType);
  };

  const handleShareEmail = () => {
    let subject = "";
    let body = "";

    if (shareType === "save-the-date") {
      subject = "Save the Date";
      body = `${saveTheDate.message}\n\nAcesse o evento aqui: ${eventLink}`;
    } else {
      subject = `Convite: ${eventDetails.title}`;
      body = `Você está convidado para ${eventDetails.title}!\n\nData: ${eventDetails.date}\nLocal: ${eventDetails.location}\n\nAcesse o evento aqui: ${eventLink}`;
    }

    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
    onShare("email", shareType);
  };

  return (
    <Card className="p-6 space-y-6 bg-white">
      <div>
        <h3 className="text-lg font-semibold mb-4">Compartilhar konvites</h3>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input value={eventLink} readOnly className="flex-1" />
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? "Copiado!" : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Tabs
            defaultValue="save-the-date"
            onValueChange={(value) =>
              setShareType(value as "save-the-date" | "invitation")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="save-the-date">Save the Date</TabsTrigger>
              <TabsTrigger value="invitation">Convite Direto</TabsTrigger>
            </TabsList>
            <TabsContent value="save-the-date" className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Envie um lembrete para seus convidados marcarem a data em suas
                agendas.
              </p>
            </TabsContent>
            <TabsContent value="invitation" className="pt-4">
              <p className="text-sm text-gray-500 mb-4">
                Envie o convite oficial com todos os detalhes do evento.
              </p>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={handleShareWhatsApp}
            >
              <MessageSquare className="h-4 w-4" />
              {shareType === "save-the-date"
                ? "Disparar Save the Date no WhatsApp"
                : "Disparar Convite no WhatsApp"}
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleShareEmail}
            >
              <Mail className="h-4 w-4" />
              {shareType === "save-the-date"
                ? "Disparar Save the Date por Email"
                : "Disparar Convite por Email"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
