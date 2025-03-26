import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AddCoOrganizerDialog from "./AddCoOrganizerDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";

interface EventManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void>;
  event: {
    id: string;
    title: string;
    description?: string;
    date: Date;
    time: string;
    location: string;
    is_private?: boolean;
    image_url?: string;
  };
}

export default function EventManagementDialog({
  open,
  onOpenChange,
  event,
}: EventManagementDialogProps) {
  const [showAddCoOrganizer, setShowAddCoOrganizer] = useState(false);
  const [coOrganizers, setCoOrganizers] = useState([]);

  useEffect(() => {
    const fetchCoOrganizers = async () => {
      const { data: organizers, error } = await supabase
        .from("event_co_organizers")
        .select("*")
        .eq("event_id", event.id);

      if (!error && organizers) {
        setCoOrganizers(
          organizers.map((org) => ({
            id: org.id,
            name: org.name,
            email: org.email,
            phone: org.phone,
            avatar: org.avatar_url,
          })),
        );
      }
    };

    fetchCoOrganizers();
  }, [event.id]);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    date: event.date.toISOString().split("T")[0],
    time: event.time,
    location: event.location,
    isPrivate: event.is_private || false,
    showGuestList: true,
    allowPlusOnes: true,
    showDietaryRestrictions: true,
  });

  const handleSave = async () => {
    try {
      // Update event details
      const { error: eventError } = await supabase
        .from("events")
        .update({
          title: formData.title,
          description: formData.description,
          date: new Date(`${formData.date}T${formData.time}`).toISOString(),
          time: formData.time,
          location: formData.location,
          is_private: formData.isPrivate,
        })
        .eq("id", event.id);

      if (eventError) throw eventError;

      // Update event settings
      const { error: settingsError } = await supabase
        .from("event_settings")
        .upsert({
          id: event.id,
          event_id: event.id,
          show_guest_list: formData.showGuestList,
          allow_plus_ones: formData.allowPlusOnes,
          show_dietary_restrictions: formData.showDietaryRestrictions,
        });

      if (settingsError) throw settingsError;

      // Update co-organizers
      const { error: coOrganizersError } = await supabase
        .from("event_co_organizers")
        .delete()
        .eq("event_id", event.id);

      if (coOrganizersError) throw coOrganizersError;

      if (coOrganizers.length > 0) {
        const { error: insertError } = await supabase
          .from("event_co_organizers")
          .insert(
            coOrganizers.map((org) => ({
              event_id: event.id,
              name: org.name,
              email: org.email,
              avatar_url: org.avatar,
            })),
          );

        if (insertError) throw insertError;
      }

      // Refresh the event data in the parent component
      await onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Erro ao atualizar evento. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Evento</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes do Evento</TabsTrigger>
            <TabsTrigger value="coorganizers">Co-organizadores</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="space-y-4 py-4 overflow-y-auto"
          >
            <div className="space-y-2">
              <Label>Nome do evento</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Local</Label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Banner do evento</Label>
              <div className="relative h-[200px] bg-muted rounded-lg overflow-hidden">
                <img
                  src={
                    event.image_url ||
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
                  }
                  alt="Event banner"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="secondary"
                  className="absolute bottom-4 right-4"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        // Handle image upload
                      }
                    };
                    input.click();
                  }}
                >
                  Alterar banner
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coorganizers" className="py-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Co-organizadores</h3>
                <Button
                  onClick={() => setShowAddCoOrganizer(true)}
                  disabled={coOrganizers.length >= 5}
                >
                  Adicionar co-organizador
                </Button>
              </div>

              <div className="space-y-4">
                {coOrganizers.map((organizer) => (
                  <div
                    key={organizer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={organizer.avatar} />
                        <AvatarFallback>
                          {organizer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{organizer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {organizer.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCoOrganizers(
                          coOrganizers.filter((o) => o.id !== organizer.id),
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="settings"
            className="space-y-6 py-4 overflow-y-auto"
          >
            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <Label>Evento privado</Label>
                <p className="text-sm text-muted-foreground">
                  Apenas convidados podem ver os detalhes do evento
                </p>
              </div>
              <Switch
                checked={formData.isPrivate}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPrivate: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <Label>Mostrar lista de convidados</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que os convidados vejam quem mais foi convidado
                </p>
              </div>
              <Switch
                checked={formData.showGuestList}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showGuestList: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <Label>Permitir acompanhantes</Label>
                <p className="text-sm text-muted-foreground">
                  Convidados podem trazer acompanhantes
                </p>
              </div>
              <Switch
                checked={formData.allowPlusOnes}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowPlusOnes: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex-1 space-y-1">
                <Label>Restrições alimentares</Label>
                <p className="text-sm text-muted-foreground">
                  Perguntar sobre restrições alimentares na confirmação
                </p>
              </div>
              <Switch
                checked={formData.showDietaryRestrictions}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showDietaryRestrictions: checked })
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar alterações</Button>
        </div>
      </DialogContent>

      <AddCoOrganizerDialog
        open={showAddCoOrganizer}
        onOpenChange={setShowAddCoOrganizer}
        onAdd={(organizer) => {
          setCoOrganizers([
            ...coOrganizers,
            {
              id: Math.random().toString(),
              name: organizer.name,
              email: organizer.email || "",
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${organizer.name}`,
            },
          ]);
        }}
      />
    </Dialog>
  );
}
