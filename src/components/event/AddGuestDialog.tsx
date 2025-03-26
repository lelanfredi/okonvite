import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Guest } from "./GuestImport";
import { useI18n } from "@/lib/i18n";

interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (guest: Guest) => void;
}

export default function AddGuestDialog({
  open,
  onOpenChange,
  onAdd,
}: AddGuestDialogProps) {
  const { t, language } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Validate
    if (!name) {
      setError(language === "pt" ? "Nome é obrigatório" : "Name is required");
      return;
    }
    if (!email && !phone) {
      setError(
        language === "pt"
          ? "Email ou telefone é obrigatório"
          : "Either email or phone is required",
      );
      return;
    }

    // Add guest
    onAdd({ name, email, phone });

    // Reset form
    setName("");
    setEmail("");
    setPhone("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === "pt" ? "Adicionar Convidado" : "Add Guest"}
          </DialogTitle>
          <DialogDescription>
            {language === "pt"
              ? "Adicione um novo convidado ao seu evento. Nome e pelo menos um método de contato são obrigatórios."
              : "Add a new guest to your event. Name and at least one contact method is required."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {language === "pt" ? "Nome *" : "Name *"}
            </Label>
            <Input
              id="name"
              placeholder={
                language === "pt"
                  ? "Digite o nome do convidado"
                  : "Enter guest name"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={
                language === "pt"
                  ? "Digite o email do convidado"
                  : "Enter guest email"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {language === "pt" ? "Telefone" : "Phone"}
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={
                language === "pt"
                  ? "Digite o telefone do convidado"
                  : "Enter guest phone"
              }
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === "pt" ? "Cancelar" : "Cancel"}
          </Button>
          <Button onClick={handleSubmit}>
            {language === "pt" ? "Adicionar Convidado" : "Add Guest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
