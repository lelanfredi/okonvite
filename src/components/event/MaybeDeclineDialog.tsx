import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BellRing, MessageSquare, Calendar } from "lucide-react";

interface MaybeDeclineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseType: "maybe" | "declined";
  eventTitle: string;
  eventDate: Date;
  onContinue: () => void;
  onAddReminder?: (shouldRemind: boolean) => void;
  onSendMessage?: (message: string) => void;
}

export default function MaybeDeclineDialog({
  open,
  onOpenChange,
  responseType,
  eventTitle,
  eventDate,
  onContinue,
  onAddReminder,
  onSendMessage,
}: MaybeDeclineDialogProps) {
  const [message, setMessage] = useState("");
  const [wantReminder, setWantReminder] = useState(false);

  const handleSubmit = () => {
    if (responseType === "maybe" && onAddReminder) {
      onAddReminder(wantReminder);
    }

    if (message.trim() && onSendMessage) {
      onSendMessage(message);
    }

    onContinue();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {responseType === "maybe"
              ? "Talvez compareça"
              : "Não poderá comparecer"}
          </DialogTitle>
          <DialogDescription>
            Obrigado por informar sobre sua presença para o evento{" "}
            <span className="font-medium">{eventTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {responseType === "maybe" && (
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="reminder" className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-muted-foreground" />
                  Receber lembrete próximo à data
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enviaremos um lembrete 2 dias antes do evento
                </p>
              </div>
              <Switch
                id="reminder"
                checked={wantReminder}
                onCheckedChange={setWantReminder}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Mensagem para o anfitrião (opcional)
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva uma mensagem para o organizador do evento..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
