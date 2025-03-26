import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  HelpCircle,
  X,
  User,
  Mail,
  Phone,
  Users,
  UtensilsCrossed,
} from "lucide-react";

interface GuestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guestId: string;
}

export default function GuestDetailsDialog({
  open,
  onOpenChange,
  guestId,
}: GuestDetailsDialogProps) {
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"confirmed" | "maybe" | "declined">();
  const [guestsCount, setGuestsCount] = useState(0);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && guestId) {
      fetchGuestDetails();
    }
  }, [open, guestId]);

  const fetchGuestDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("id", guestId)
        .single();

      if (error) throw error;

      if (data) {
        setGuest(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setStatus(data.status as "confirmed" | "maybe" | "declined");
        setGuestsCount(data.guests_count || 0);
        setDietaryRestrictions(data.dietary_restrictions || "");
        setMessage(data.message || "");
      }
    } catch (error) {
      console.error("Error fetching guest details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
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
        .eq("id", guestId);

      if (error) throw error;

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating guest:", error);
      alert("Erro ao atualizar convidado. Tente novamente.");
    }
  };

  const getStatusBadge = () => {
    if (status === "confirmed") {
      return (
        <div className="flex items-center gap-1 text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full text-sm">
          <Check className="h-4 w-4" />
          Confirmado
        </div>
      );
    } else if (status === "maybe") {
      return (
        <div className="flex items-center gap-1 text-amber-600 bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded-full text-sm">
          <HelpCircle className="h-4 w-4" />
          Talvez
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-red-600 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full text-sm">
          <X className="h-4 w-4" />
          Recusado
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Convidado</DialogTitle>
          <DialogDescription>
            Visualize e edite as informações do convidado
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{guest?.name}</h3>
              {getStatusBadge()}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Nome
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={status === "confirmed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatus("confirmed")}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" /> Sim
                  </Button>
                  <Button
                    type="button"
                    variant={status === "maybe" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatus("maybe")}
                    className="flex items-center gap-1"
                  >
                    <HelpCircle className="h-4 w-4" /> Talvez
                  </Button>
                  <Button
                    type="button"
                    variant={status === "declined" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setStatus("declined")}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" /> Não
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Acompanhantes
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min="0"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary" className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4" /> Restrições alimentares
                </Label>
                <Input
                  id="dietary"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar alterações</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
