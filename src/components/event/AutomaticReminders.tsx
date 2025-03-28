import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Wand2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Bell } from "lucide-react";

interface AutomaticRemindersProps {
  eventId: string;
  eventDate: Date;
  onSave: (settings: {
    enabled: boolean;
    frequency: "once" | "daily" | "weekly";
    firstReminderDate: Date;
    firstReminderTime: string;
    sendFinalReminder: boolean;
    channels: {
      email: boolean;
      whatsapp: boolean;
    };
    messageTemplate: string;
  }) => void;
}

export default function AutomaticReminders({
  eventId,
  eventDate,
  onSave,
}: AutomaticRemindersProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly">("once");
  const [firstReminderDate, setFirstReminderDate] = useState(new Date());
  const [firstReminderTime, setFirstReminderTime] = useState("09:00");
  const [sendFinalReminder, setSendFinalReminder] = useState(true);
  const [channels, setChannels] = useState({
    email: true,
    whatsapp: true,
  });
  const [messageTemplate, setMessageTemplate] = useState("");

  const handleSave = () => {
    if (enabled && !channels.email && !channels.whatsapp) {
      toast({
        variant: "destructive",
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt"
          ? "Selecione pelo menos um canal de envio"
          : "Select at least one sending channel",
      });
      return;
    }

    onSave({
      enabled,
      frequency,
      firstReminderDate,
      firstReminderTime,
      sendFinalReminder,
      channels,
      messageTemplate,
    });

    toast({
      title: language === "pt" ? "Configurações salvas" : "Settings saved",
      description: language === "pt"
        ? "As configurações de lembretes foram salvas com sucesso"
        : "Reminder settings have been saved successfully",
    });
  };

  const handleUseTemplate = () => {
    const template = language === "pt"
      ? `Olá! Este é um lembrete para o evento que você foi convidado.
      
Por favor, confirme sua presença respondendo a este convite.

Aguardamos sua resposta!`
      : `Hi! This is a reminder for the event you were invited to.
      
Please confirm your attendance by responding to this invitation.

We look forward to your response!`;

    setMessageTemplate(template);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-base font-medium text-primary">
            {language === "pt" ? "Lembretes Automáticos" : "Automatic Reminders"}
          </h3>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label={
            language === "pt"
              ? "Ativar lembretes automáticos"
              : "Enable automatic reminders"
          }
        />
      </div>

      <div className={enabled ? "space-y-6" : "opacity-50 pointer-events-none space-y-6"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                {language === "pt" ? "Frequência" : "Frequency"}
              </Label>
              <Select value={frequency} onValueChange={(value: "once" | "daily" | "weekly") => setFrequency(value)}>
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

            <div className="space-y-2">
              <Label>
                {language === "pt" ? "Primeiro lembrete" : "First reminder"}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={firstReminderDate.toISOString().split("T")[0]}
                  onChange={(e) => setFirstReminderDate(new Date(e.target.value))}
                  min={new Date().toISOString().split("T")[0]}
                  max={eventDate.toISOString().split("T")[0]}
                />
                <Input
                  type="time"
                  value={firstReminderTime}
                  onChange={(e) => setFirstReminderTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="final-reminder"
                checked={sendFinalReminder}
                onCheckedChange={(checked) => setSendFinalReminder(checked as boolean)}
              />
              <Label htmlFor="final-reminder" className="text-sm">
                {language === "pt"
                  ? "Enviar lembrete final 2 dias antes"
                  : "Send final reminder 2 days before"}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>
                {language === "pt" ? "Canais de envio" : "Sending channels"}
              </Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-email"
                    checked={channels.email}
                    onCheckedChange={(checked) =>
                      setChannels({ ...channels, email: checked as boolean })
                    }
                  />
                  <Label htmlFor="channel-email" className="text-sm">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="channel-whatsapp"
                    checked={channels.whatsapp}
                    onCheckedChange={(checked) =>
                      setChannels({ ...channels, whatsapp: checked as boolean })
                    }
                  />
                  <Label htmlFor="channel-whatsapp" className="text-sm">WhatsApp</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                {language === "pt" ? "Mensagem do Lembrete" : "Reminder Message"}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleUseTemplate}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                {language === "pt" ? "Usar modelo" : "Use template"}
              </Button>
            </div>
            <Textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder={
                language === "pt"
                  ? "Digite a mensagem que será enviada nos lembretes..."
                  : "Type the message that will be sent in the reminders..."
              }
              className="min-h-[200px]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            {language === "pt" ? "Salvar Configurações" : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
} 