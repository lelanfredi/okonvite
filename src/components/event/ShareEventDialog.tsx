import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share, Copy, Check, MessageSquare, Mail, Link } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ShareEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  eventUrl: string;
}

export default function ShareEventDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  eventUrl,
}: ShareEventDialogProps) {
  const [copied, setCopied] = useState(false);
  const [personalMessage, setPersonalMessage] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink || eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePersonalLink = async () => {
    setIsGeneratingLink(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Generate a unique code
      const shareCode = Math.random().toString(36).substring(2, 10);

      // Save the share record
      const { error } = await supabase.from("event_shares").insert({
        event_id: eventId,
        shared_by: user.id,
        share_code: shareCode,
      });

      if (error) throw error;

      // Create the shareable URL
      const shareableUrl = `${eventUrl}?ref=${shareCode}`;
      setShareLink(shareableUrl);
    } catch (error) {
      console.error("Error generating share link:", error);
      alert(
        "Não foi possível gerar o link de compartilhamento. Tente novamente.",
      );
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const shareViaWhatsApp = () => {
    const text = personalMessage
      ? `${personalMessage}\n\n${eventTitle}\n${shareLink || eventUrl}`
      : `Olá! Gostaria de convidar você para o evento "${eventTitle}". Confira os detalhes aqui: ${shareLink || eventUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareViaEmail = () => {
    const subject = `Convite para ${eventTitle}`;
    const body = personalMessage
      ? `${personalMessage}\n\n${eventTitle}\n${shareLink || eventUrl}`
      : `Olá! Gostaria de convidar você para o evento "${eventTitle}". Confira os detalhes aqui: ${shareLink || eventUrl}`;

    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank",
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Compartilhar evento
          </DialogTitle>
          <DialogDescription>
            Convide amigos e familiares para o evento "{eventTitle}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="share-link">Link para compartilhar</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generatePersonalLink}
                  disabled={isGeneratingLink}
                >
                  Gerar link único
                </Button>
              </div>
              <div className="flex space-x-2">
                <Input
                  id="share-link"
                  value={shareLink || eventUrl}
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {shareLink && (
                <p className="text-xs text-muted-foreground">
                  Este link rastreará quem visualizou seu convite
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="personal-message">
                Mensagem personalizada (opcional)
              </Label>
              <Textarea
                id="personal-message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Escreva uma mensagem personalizada para enviar junto com o convite"
                className="min-h-[100px]"
              />
            </div>
            <Button
              onClick={shareViaWhatsApp}
              className="w-full flex items-center gap-2"
              variant="default"
            >
              <MessageSquare className="h-4 w-4" />
              Compartilhar via WhatsApp
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-message">
                Mensagem personalizada (opcional)
              </Label>
              <Textarea
                id="email-message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="Escreva uma mensagem personalizada para enviar junto com o convite"
                className="min-h-[100px]"
              />
            </div>
            <Button
              onClick={shareViaEmail}
              className="w-full flex items-center gap-2"
              variant="default"
            >
              <Mail className="h-4 w-4" />
              Compartilhar via Email
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Textarea = ({ id, value, onChange, placeholder, className }: any) => {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
};
