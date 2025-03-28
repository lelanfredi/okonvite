import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";

interface ReminderSettings {
  enabled: boolean;
  frequency: "once" | "daily" | "weekly";
  daysBeforeEvent: number;
  messageTemplate: string;
}

interface ReminderSettingsProps {
  eventDate: Date;
  onSettingsChange: (settings: ReminderSettings) => void;
}

export default function ReminderSettings({
  eventDate,
  onSettingsChange,
}: ReminderSettingsProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    frequency: "once",
    daysBeforeEvent: 7,
    messageTemplate: language === "pt"
      ? "Olá! Este é um lembrete para o evento. Por favor, confirme sua presença."
      : "Hi! This is a reminder for the event. Please confirm your attendance.",
  });

  const handleToggle = (checked: boolean) => {
    const newSettings = { ...settings, enabled: checked };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    
    toast({
      title: checked
        ? language === "pt"
          ? "Lembretes ativados"
          : "Reminders enabled"
        : language === "pt"
          ? "Lembretes desativados"
          : "Reminders disabled",
    });
  };

  const updateSettings = (updates: Partial<ReminderSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">
            {language === "pt" ? "Lembretes Automáticos" : "Automatic Reminders"}
          </Label>
          <p className="text-sm text-muted-foreground">
            {language === "pt"
              ? "Enviar lembretes automáticos para convidados que não responderam"
              : "Send automatic reminders to guests who haven't responded"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggle}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                disabled={!settings.enabled}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {language === "pt" ? "Configurar Lembretes" : "Configure Reminders"}
                </DialogTitle>
                <DialogDescription>
                  {language === "pt"
                    ? "Defina quando e como os lembretes serão enviados"
                    : "Set when and how reminders will be sent"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>
                    {language === "pt" ? "Frequência" : "Frequency"}
                  </Label>
                  <Select
                    value={settings.frequency}
                    onValueChange={(value: "once" | "daily" | "weekly") =>
                      updateSettings({ frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">
                        {language === "pt" ? "Uma vez" : "Once"}
                      </SelectItem>
                      <SelectItem value="daily">
                        {language === "pt" ? "Diariamente" : "Daily"}
                      </SelectItem>
                      <SelectItem value="weekly">
                        {language === "pt" ? "Semanalmente" : "Weekly"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>
                    {language === "pt"
                      ? "Dias antes do evento"
                      : "Days before event"}
                  </Label>
                  <Select
                    value={settings.daysBeforeEvent.toString()}
                    onValueChange={(value) =>
                      updateSettings({ daysBeforeEvent: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 7, 14, 30].map((days) => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} {language === "pt" ? "dias" : "days"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>
                    {language === "pt"
                      ? "Mensagem do lembrete"
                      : "Reminder message"}
                  </Label>
                  <textarea
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={settings.messageTemplate}
                    onChange={(e) =>
                      updateSettings({ messageTemplate: e.target.value })
                    }
                    placeholder={
                      language === "pt"
                        ? "Digite a mensagem do lembrete..."
                        : "Type the reminder message..."
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === "pt"
                      ? "Esta mensagem será enviada automaticamente para os convidados que ainda não responderam."
                      : "This message will be automatically sent to guests who haven't responded yet."}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 