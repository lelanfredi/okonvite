import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, HelpCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import AuthDialog from "../auth/AuthDialog";
import { supabase } from "@/lib/supabase";

interface RsvpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  onSuccess?: () => void;
}

export default function RsvpDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  eventDate,
  onSuccess,
}: RsvpDialogProps) {
  const [status, setStatus] = useState<"confirmed" | "maybe" | "declined">();
  const [message, setMessage] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusSelect = async (newStatus: "confirmed" | "maybe" | "declined") => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setStatus(newStatus);
      setShowAuthDialog(true);
      return;
    }

    setStatus(newStatus);
  };

  const handleSubmit = async () => {
    if (!status) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setShowAuthDialog(true);
        return;
      }

      // Aqui você implementaria a lógica para salvar a resposta no banco de dados
      const { error } = await supabase
        .from("event_responses")
        .upsert({
          event_id: eventId,
          user_id: session.user.id,
          status,
          message: message || null,
        });

      if (error) throw error;

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthComplete = () => {
    setShowAuthDialog(false);
    // Após o login bem-sucedido, continua com a submissão
    handleSubmit();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Presença</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Button
                onClick={() => handleStatusSelect("confirmed")}
                variant={status === "confirmed" ? "default" : "outline"}
                className="w-full flex items-center justify-start gap-2"
              >
                <Check className="h-5 w-5 text-green-600" />
                Sim, vou comparecer
              </Button>

              <Button
                onClick={() => handleStatusSelect("maybe")}
                variant={status === "maybe" ? "default" : "outline"}
                className="w-full flex items-center justify-start gap-2"
              >
                <HelpCircle className="h-5 w-5 text-amber-500" />
                Talvez eu compareça
              </Button>

              <Button
                onClick={() => handleStatusSelect("declined")}
                variant={status === "declined" ? "default" : "outline"}
                className="w-full flex items-center justify-start gap-2"
              >
                <X className="h-5 w-5 text-red-600" />
                Não poderei comparecer
              </Button>
            </div>

            {status && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mensagem para o anfitrião (opcional)
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva uma mensagem..."
                  rows={3}
                />
              </div>
            )}

            {status && (
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar resposta"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onComplete={handleAuthComplete}
      />
    </>
  );
} 