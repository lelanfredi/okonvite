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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface AddCoOrganizerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (organizer: {
    name: string;
    email?: string;
    phone?: string;
    notifyBy: {
      email: boolean;
      whatsapp: boolean;
    };
  }) => void;
}

export default function AddCoOrganizerDialog({
  open,
  onOpenChange,
  onAdd,
}: AddCoOrganizerDialogProps) {
  const [notifyByEmail, setNotifyByEmail] = useState(false);
  const [notifyByWhatsapp, setNotifyByWhatsapp] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const notifyByEmail = formData.get("notifyByEmail") === "on";
    const notifyByWhatsapp = formData.get("notifyByWhatsapp") === "on";

    if (!name || (!notifyByEmail && !notifyByWhatsapp)) return;

    onAdd({
      name,
      email: email || undefined,
      phone: phone || undefined,
      notifyBy: {
        email: notifyByEmail,
        whatsapp: notifyByWhatsapp,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Co-organizador</DialogTitle>
          <DialogDescription>
            Adicione os detalhes do co-organizador e como ele será notificado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-4">
            <Label>Notificar por</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyByEmail"
                    checked={notifyByEmail}
                    onCheckedChange={(checked) =>
                      setNotifyByEmail(checked as boolean)
                    }
                  />
                  <Label htmlFor="notifyByEmail">Email</Label>
                </div>
                {notifyByEmail && (
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite o email"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifyByWhatsapp"
                    checked={notifyByWhatsapp}
                    onCheckedChange={(checked) =>
                      setNotifyByWhatsapp(checked as boolean)
                    }
                  />
                  <Label htmlFor="notifyByWhatsapp">WhatsApp</Label>
                </div>
                {notifyByWhatsapp && (
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Digite o número do WhatsApp"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
