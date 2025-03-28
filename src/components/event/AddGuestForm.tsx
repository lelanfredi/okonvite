import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface AddGuestFormProps {
  onAdd: (guest: { name: string; email?: string; phone?: string }) => void;
}

export default function AddGuestForm({ onAdd }: AddGuestFormProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [guest, setGuest] = useState<{ name: string; email?: string; phone?: string }>({
    name: "",
    email: "",
    phone: "",
  });

  const validateGuest = () => {
    const errors: string[] = [];

    if (!guest.name?.trim()) {
      errors.push(language === "pt" ? "Nome é obrigatório" : "Name is required");
    }

    // Pelo menos um campo de contato deve estar preenchido
    if (!guest.email?.trim() && !guest.phone?.trim()) {
      errors.push(
        language === "pt"
          ? "Preencha pelo menos um campo de contato (email ou telefone)"
          : "Fill in at least one contact field (email or phone)"
      );
    }

    // Se email estiver preenchido, validar formato
    if (guest.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      errors.push(
        language === "pt"
          ? "Formato de email inválido"
          : "Invalid email format"
      );
    }

    // Se telefone estiver preenchido, validar formato básico
    if (guest.phone?.trim() && !/^\+?[\d\s-()]+$/.test(guest.phone)) {
      errors.push(
        language === "pt"
          ? "Formato de telefone inválido"
          : "Invalid phone format"
      );
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateGuest();
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: language === "pt" ? "Erro" : "Error",
        description: errors.join(". "),
      });
      return;
    }

    const success = await onAdd(guest);
    if (success) {
      setGuest({ name: "", email: "", phone: "" });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-4 h-4 text-primary" />
        <h3 className="text-base font-medium text-primary">
          {language === "pt" ? "Adicionar Convidado" : "Add Guest"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="name" className="text-sm text-foreground">
              {language === "pt" ? "Nome" : "Name"} *
            </Label>
            <Input
              id="name"
              value={guest.name}
              onChange={(e) => setGuest({ ...guest, name: e.target.value })}
              placeholder={
                language === "pt"
                  ? "Digite o nome do convidado"
                  : "Enter guest name"
              }
              className="mt-1 h-9"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={guest.email}
              onChange={(e) => setGuest({ ...guest, email: e.target.value })}
              placeholder={
                language === "pt"
                  ? "Digite o email do convidado"
                  : "Enter guest email"
              }
              className="mt-1 h-9"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm text-foreground">
              {language === "pt" ? "Telefone" : "Phone"}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={guest.phone}
              onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
              placeholder={
                language === "pt"
                  ? "Digite o telefone do convidado"
                  : "Enter guest phone"
              }
              className="mt-1 h-9"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm">
            {language === "pt" ? "Adicionar" : "Add"}
          </Button>
        </div>
      </form>
    </Card>
  );
} 