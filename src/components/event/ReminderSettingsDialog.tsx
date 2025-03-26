import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BellRing, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReminderSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  defaultSettings?: {
    emailReminders: boolean;
    whatsappReminders: boolean;
    oneWeekReminder: boolean;
    oneDayReminder: boolean;
    updateNotifications: boolean;
  };
}

export default function ReminderSettingsDialog({
  open,
  onOpenChange,
  eventId,
  defaultSettings = {
    emailReminders: true,
    whatsappReminders: false,
    oneWeekReminder: true,
    oneDayReminder: true,
    updateNotifications: true,
  },
}: ReminderSettingsDialogProps) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!eventId) return;

    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Get the user's RSVP for this event
      const { data: rsvp, error: rsvpError } = await supabase
        .from("event_rsvps")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (rsvpError) {
        throw new Error(
          "Não foi possível encontrar sua confirmação para este evento",
        );
      }

      // Update or insert reminder settings
      const { data: existingSettings } = await supabase
        .from("event_reminder_settings")
        .select("id")
        .eq("rsvp_id", rsvp.id)
        .single();

      if (existingSettings) {
        // Update existing settings
        await supabase
          .from("event_reminder_settings")
          .update({
            email_reminders: settings.emailReminders,
            whatsapp_reminders: settings.whatsappReminders,
            one_week_reminder: settings.oneWeekReminder,
            one_day_reminder: settings.oneDayReminder,
            update_notifications: settings.updateNotifications,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSettings.id);
      } else {
        // Insert new settings
        await supabase.from("event_reminder_settings").insert({
          rsvp_id: rsvp.id,
          email_reminders: settings.emailReminders,
          whatsapp_reminders: settings.whatsappReminders,
          one_week_reminder: settings.oneWeekReminder,
          one_day_reminder: settings.oneDayReminder,
          update_notifications: settings.updateNotifications,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving reminder settings:", error);
      alert(
        "Não foi possível salvar suas configurações de lembretes. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Configurações de Lembretes
          </DialogTitle>
          <DialogDescription>
            Personalize como e quando deseja receber lembretes sobre este
            evento.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Canais de Notificação</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-reminders">Lembretes por Email</Label>
                </div>
                <Switch
                  id="email-reminders"
                  checked={settings.emailReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailReminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="whatsapp-reminders">
                    Lembretes por WhatsApp
                  </Label>
                </div>
                <Switch
                  id="whatsapp-reminders"
                  checked={settings.whatsappReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, whatsappReminders: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Reminder Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Programação de Lembretes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="one-week-reminder">
                  1 semana antes do evento
                </Label>
                <Switch
                  id="one-week-reminder"
                  checked={settings.oneWeekReminder}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, oneWeekReminder: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="one-day-reminder">1 dia antes do evento</Label>
                <Switch
                  id="one-day-reminder"
                  checked={settings.oneDayReminder}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, oneDayReminder: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Event Updates */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Atualizações do Evento</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="update-notifications">
                  Notificações de alterações
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receba notificações quando houver mudanças importantes no
                  evento
                </p>
              </div>
              <Switch
                id="update-notifications"
                checked={settings.updateNotifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, updateNotifications: checked })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
