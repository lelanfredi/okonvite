import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, HelpCircle, X, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ChangeRsvpStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  currentStatus: string;
  onStatusChanged: () => void;
  eventDetails: {
    title: string;
    date: Date;
    rsvpDeadline?: Date;
  };
}

export default function ChangeRsvpStatusDialog({
  open,
  onOpenChange,
  eventId,
  currentStatus,
  onStatusChanged,
  eventDetails,
}: ChangeRsvpStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<string>(currentStatus);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPastDeadline, setIsPastDeadline] = useState(false);

  useEffect(() => {
    if (eventDetails.rsvpDeadline) {
      const deadline = new Date(eventDetails.rsvpDeadline);
      setIsPastDeadline(new Date() > deadline);
    }
  }, [eventDetails.rsvpDeadline]);

  const handleSubmit = async () => {
    if (newStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Get the current RSVP
      const { data: rsvp, error: rsvpError } = await supabase
        .from("event_rsvps")
        .select("id, status")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (rsvpError || !rsvp) {
        throw new Error("Não foi possível encontrar sua resposta atual");
      }

      // Add to history
      await supabase.from("event_rsvp_history").insert({
        rsvp_id: rsvp.id,
        previous_status: rsvp.status,
        new_status: newStatus,
        changed_by: user.id,
      });

      // Update the RSVP
      const { error: updateError } = await supabase
        .from("event_rsvps")
        .update({
          status: newStatus,
          message: message || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rsvp.id);

      if (updateError) {
        throw updateError;
      }

      onStatusChanged();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating RSVP status:", error);
      alert("Não foi possível atualizar seu status. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar resposta</DialogTitle>
          <DialogDescription>
            {isPastDeadline ? (
              <div className="text-destructive mt-2">
                O prazo para alteração de resposta já passou. Entre em contato
                com o organizador.
              </div>
            ) : (
              <div>
                Você pode alterar sua resposta para o evento{" "}
                <span className="font-medium">{eventDetails.title}</span> até{" "}
                {eventDetails.rsvpDeadline ? (
                  <span className="font-medium">
                    {new Date(eventDetails.rsvpDeadline).toLocaleDateString()}
                  </span>
                ) : (
                  "a data do evento"
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isPastDeadline && (
          <div className="py-4 space-y-6">
            <RadioGroup
              value={newStatus}
              onValueChange={setNewStatus}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="confirmed" id="confirmed" />
                <Label
                  htmlFor="confirmed"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Sim, vou comparecer</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="maybe" id="maybe" />
                <Label
                  htmlFor="maybe"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <HelpCircle className="h-5 w-5 text-amber-500" />
                  <span>Talvez eu compareça</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value="declined" id="declined" />
                <Label
                  htmlFor="declined"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <X className="h-5 w-5 text-destructive" />
                  <span>Não poderei comparecer</span>
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem (opcional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explique o motivo da alteração (opcional)"
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {!isPastDeadline && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || newStatus === currentStatus}
              className="w-full"
            >
              {isSubmitting ? "Atualizando..." : "Confirmar alteração"}
            </Button>
          )}
          {isPastDeadline && (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
