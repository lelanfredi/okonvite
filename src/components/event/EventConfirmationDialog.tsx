import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
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

interface EventConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventDetails: {
    id?: string;
    title: string;
    date: Date;
    time: string;
    location: string;
    settings?: {
      allow_plus_ones: boolean;
      show_dietary_restrictions: boolean;
    };
  };
  onConfirm: (message?: string) => void;
  onMaybe: (message?: string) => void;
  onDecline: (message?: string) => void;
}

export default function EventConfirmationDialog({
  open,
  onOpenChange,
  eventDetails,
  onConfirm,
  onMaybe,
  onDecline,
}: EventConfirmationDialogProps) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"confirmed" | "maybe" | "declined">();
  const [guestsCount, setGuestsCount] = useState(0);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [session, setSession] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    console.log("Submitting with status:", status);
    if (!status) return;
    if (status !== "declined" && (!name || (!email && !phone))) {
      alert(
        "Por favor, preencha seu nome e pelo menos um contato (email ou telefone)",
      );
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated");
        setShowAuth(true);
        return;
      }

      // Check if there's an existing RSVP for this user and event
      const { data: existingRsvp } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", eventDetails.id)
        .eq("user_id", user?.id)
        .maybeSingle();

      let result;
      if (existingRsvp) {
        // Update existing RSVP
        result = await supabase
          .from("event_rsvps")
          .update({
            name,
            email,
            phone,
            status,
            guests_count: guestsCount,
            dietary_restrictions: dietaryRestrictions,
            message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRsvp.id);
      } else {
        // Insert new RSVP
        result = await supabase.from("event_rsvps").insert([
          {
            event_id: eventDetails.id,
            user_id: user?.id,
            name,
            email,
            phone,
            status,
            guests_count: guestsCount,
            dietary_restrictions: dietaryRestrictions,
            message,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }

      if (result.error) throw result.error;

      // Send confirmation notification if confirmed
      if (status === "confirmed") {
        try {
          // Send confirmation notification
          await NotificationService.sendConfirmation(
            {
              id: eventDetails.id,
              title: eventDetails.title,
              date: eventDetails.date.toLocaleDateString(),
              time: eventDetails.time,
              location: eventDetails.location,
            },
            {
              id: user.id,
              name: name,
              email: email,
              phone: phone,
            },
            [email ? "email" : null, phone ? "whatsapp" : null].filter(
              Boolean,
            ) as ("email" | "whatsapp")[],
          );
        } catch (error) {
          console.error("Error sending confirmation notification:", error);
        }

        console.log("Setting success message to true");
        // For confirmed status, show success message in the same dialog
        setShowSuccessMessage(true);
        // Still call the callback so parent component knows about the confirmation
        onConfirm(message);
      } else if (status === "maybe") {
        onOpenChange(false);
        onMaybe(message);
      } else {
        onOpenChange(false);
        onDecline(message);
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      alert("Erro ao confirmar presença. Tente novamente.");
    }
  };

  const handleClose = () => {
    // Reset all state when closing the dialog
    onOpenChange(false);
    setStep(1);
    setStatus(undefined);
    setShowSuccessMessage(false);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setGuestsCount(0);
    setDietaryRestrictions("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={true}>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{eventDetails.title}</DialogTitle>
          <DialogDescription>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                {eventDetails.date.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {eventDetails.time}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {eventDetails.location}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {showSuccessMessage === true ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <PartyPopper className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-medium">Presença confirmada!</h3>
              <p className="text-muted-foreground">
                Obrigado por confirmar sua presença em {eventDetails.title}.
                Estamos ansiosos para vê-lo lá!
              </p>
              <div className="space-y-2 mt-4 bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4" />
                  {eventDetails.date.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {eventDetails.time}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  {eventDetails.location}
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleClose}>
                Voltar para o evento
              </Button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-center">
                    Você poderá comparecer?
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={status === "confirmed" ? "default" : "outline"}
                      className="flex flex-col py-6"
                      onClick={() => {
                        if (!session) {
                          setShowAuth(true);
                          setStatus("confirmed");
                        } else {
                          setStatus("confirmed");
                          setStep(2);
                        }
                      }}
                    >
                      <Check className="h-6 w-6 mb-2" />
                      Sim!
                    </Button>
                    <Button
                      variant={status === "maybe" ? "default" : "outline"}
                      className="flex flex-col py-6"
                      onClick={() => {
                        if (!session) {
                          setShowAuth(true);
                          setStatus("maybe");
                        } else {
                          setStatus("maybe");
                          setStep(2);
                        }
                      }}
                    >
                      <HelpCircle className="h-6 w-6 mb-2" />
                      Talvez
                    </Button>
                    <Button
                      variant={
                        status === "declined" ? "destructive" : "outline"
                      }
                      className="flex flex-col py-6"
                      onClick={() => {
                        if (!session) {
                          setShowAuth(true);
                          setStatus("declined");
                        } else {
                          setStatus("declined");
                          setStep(2);
                        }
                      }}
                    >
                      <X className="h-6 w-6 mb-2" />
                      Não
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && status === "declined" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Digite seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Deixe uma mensagem (opcional)
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Mensagem para o organizador"
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button className="w-full" onClick={handleSubmit}>
                    Enviar resposta
                  </Button>
                </div>
              )}

              {step === 2 && (status === "confirmed" || status === "maybe") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <Button className="w-full" onClick={() => setStep(3)}>
                    Próximo
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  {eventDetails.settings?.allow_plus_ones && (
                    <div className="space-y-2">
                      <Label htmlFor="guests">Número de acompanhantes</Label>
                      <Input
                        id="guests"
                        type="number"
                        min="0"
                        value={guestsCount}
                        onChange={(e) =>
                          setGuestsCount(parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}

                  {eventDetails.settings?.show_dietary_restrictions && (
                    <div className="space-y-2">
                      <Label htmlFor="dietary">Restrições alimentares</Label>
                      <Input
                        id="dietary"
                        value={dietaryRestrictions}
                        onChange={(e) => setDietaryRestrictions(e.target.value)}
                        placeholder="Ex: Vegetariano, Sem glúten, etc"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem (opcional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Mensagem para o organizador"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setStep(2)}
                    >
                      Voltar
                    </Button>
                    <Button className="w-full" onClick={handleSubmit}>
                      Confirmar presença
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        onComplete={() => {
          setShowAuth(false);
          setStep(2);
        }}
      />
    </Dialog>
  );
}
