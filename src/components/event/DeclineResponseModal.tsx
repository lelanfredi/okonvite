import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DeclineResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  message: string;
}

export default function DeclineResponseModal({
  isOpen,
  onClose,
  eventId,
  message,
}: DeclineResponseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase.from("event_rsvps").upsert({
        event_id: eventId,
        user_id: user.id,
        status: "declined",
        message: message,
        guests_count: 0,
      });

      if (error) throw error;

      onClose();
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-red-500" />
            Não Poderei Comparecer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Você pode deixar uma mensagem para o organizador explicando o motivo.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem (opcional)</label>
            <Textarea
              placeholder="Explique o motivo..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? "Enviando..." : "Enviar resposta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 