import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AuthDialog from "../auth/AuthDialog";
import { supabase } from "@/lib/supabase";
import { NotificationService } from "./NotificationService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  Clock,
  MapPin,
  Check,
  X,
  HelpCircle,
  PartyPopper,
} from "lucide-react";
import MaybeResponseModal from "./MaybeResponseModal";
import DeclineResponseModal from "./DeclineResponseModal";
import AddToCalendar from "./AddToCalendar";

interface EventConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventTime: string;
  eventLocation: string;
  onSuccess?: () => void;
}

export default function EventConfirmationDialog({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  onSuccess,
}: EventConfirmationDialogProps) {
  const [showMaybeModal, setShowMaybeModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = async () => {
    console.log("Iniciando confirmação de presença...");
    setError(null);
    
    try {
      setIsSubmitting(true);
      console.log("Verificando autenticação...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Erro na autenticação:", authError);
        throw new Error("Erro ao verificar autenticação");
      }

      if (!user) {
        console.log("Usuário não autenticado, redirecionando para login...");
        throw new Error("Usuário não autenticado");
      }

      console.log("Usuário autenticado:", user.id);
      console.log("Tentando salvar RSVP...");

      const { error: rsvpError } = await supabase.from("event_rsvps").upsert({
        event_id: eventId,
        user_id: user.id,
        status: "confirmed",
        message: message,
        guests_count: 0,
        created_at: new Date().toISOString(),
      });

      if (rsvpError) {
        console.error("Erro ao salvar RSVP:", rsvpError);
        throw rsvpError;
      }

      console.log("RSVP salvo com sucesso!");
      setIsConfirmed(true);
      onSuccess?.();
    } catch (error) {
      console.error("Erro completo:", error);
      setError(error instanceof Error ? error.message : "Erro ao confirmar presença");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaybe = () => {
    setShowMaybeModal(true);
  };

  const handleDecline = () => {
    setShowDeclineModal(true);
  };

  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              {isConfirmed ? "Presença Confirmada!" : "Confirmar Presença"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">{eventTitle}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>{new Date(eventDate).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{eventTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{eventLocation}</span>
              </div>
            </div>

            {!isConfirmed && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem (opcional)</label>
                  <Textarea
                    placeholder="Adicione uma mensagem para o organizador..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirmar Presença
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMaybe}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Talvez
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Não poderei ir
                  </Button>
                </div>
              </>
            )}

            {isConfirmed && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-700 dark:text-green-300 text-center">
                    Sua presença foi confirmada com sucesso! Não esqueça de adicionar o evento ao seu calendário.
                  </p>
                </div>

                <AddToCalendar
                  eventName={eventTitle}
                  startDate={eventDate}
                  location={eventLocation}
                  description={`Você confirmou presença neste evento. ${message ? `\n\nSua mensagem: ${message}` : ''}`}
                />

                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MaybeResponseModal
        isOpen={showMaybeModal}
        onClose={() => setShowMaybeModal(false)}
        eventId={eventId}
        message={message}
      />

      <DeclineResponseModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        eventId={eventId}
        message={message}
      />
    </>
  );
}
