import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import GuestImport, { Guest } from "./GuestImport";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Share2,
  MessageSquare,
  Copy,
  Check,
  X,
  Sparkles,
  UserPlus,
  Send,
  Users,
  Bell,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddGuestDialog from "./AddGuestDialog";
import GuestList from "./GuestList";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";
import InviteManager from "./InviteManager";
import AutomaticReminders from "./AutomaticReminders";

interface GuestManagementProps {
  eventId?: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  onInvite?: (method: string, guests: Guest[], message?: string) => void;
  onRsvpUpdate?: (guestId: string, status: "accepted" | "declined") => void;
}

interface Guest {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  guests_count?: number;
  dietary_restrictions?: string;
  created_at?: string;
  updated_at?: string;
}

const GuestManagement = ({
  eventId,
  eventName,
  eventDate,
  eventLocation,
  onInvite = () => {},
  onRsvpUpdate = () => {},
}: GuestManagementProps) => {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("add");
  const [shortId, setShortId] = useState<string>("");
  const [inviteLink, setInviteLink] = React.useState(
    `${window.location.origin}/e/${eventId}`,
  );
  const [copied, setCopied] = React.useState(false);
  const [showAddGuest, setShowAddGuest] = React.useState(false);
  const [messageText, setMessageText] = useState(
    language === "pt"
      ? "Você está convidado! Junte-se a nós para um evento especial. Ficaríamos encantados em tê-lo lá."
      : "You're invited! Join us for a special event. We would be delighted to have you there.",
  );
  const [messageStyle, setMessageStyle] = useState("formal");
  const [guests, setGuests] = useState<Guest[]>([]);

  const fetchGuests = async () => {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching guests:", error);
        return;
      }

      setGuests(data || []);
    } catch (error) {
      console.error("Error in fetchGuests:", error);
    }
  };

  useEffect(() => {
    fetchGuests();
    
    // Set up realtime subscription for guest updates
    if (eventId) {
      const channel = supabase
        .channel(`event_rsvps_${eventId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "event_rsvps",
            filter: `event_id=eq.${eventId}`,
          },
          () => {
            fetchGuests();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    // Buscar o short_id do evento
    const fetchShortId = async () => {
      const { data: event, error } = await supabase
        .from("events")
        .select("short_id")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error fetching short_id:", error);
        return;
      }

      if (event?.short_id) {
        setShortId(event.short_id);
        setInviteLink(`${window.location.origin}/e/${event.short_id}`);
      }
    };

    fetchShortId();
  }, [eventId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onAdd = async (guest: Guest) => {
    if (!eventId) {
      toast({
        variant: "destructive",
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt"
          ? "ID do evento não encontrado"
          : "Event ID not found",
      });
      return false;
    }

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase.from("event_rsvps").insert([
        {
          event_id: eventId,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          status: "maybe",
          guests_count: guest.guestsCount || 0,
          dietary_restrictions: guest.dietaryRestrictions || "",
          created_at: now
        },
      ]).select();

      if (error) throw error;

      // Adicionar o novo convidado à lista local
      if (data && data[0]) {
        setGuests((currentGuests) => [data[0], ...currentGuests]);
      }
      
      // Mostrar mensagem de sucesso
      toast({
        title: language === "pt" ? "Sucesso" : "Success",
        description: language === "pt" 
          ? "Convidado adicionado com sucesso" 
          : "Guest added successfully",
      });

      return true;
    } catch (error) {
      console.error("Error adding guest:", error);
      
      // Mostrar mensagem de erro
      toast({
        variant: "destructive",
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt"
          ? "Erro ao adicionar convidado. Por favor, tente novamente."
          : "Error adding guest. Please try again.",
      });

      return false;
    }
  };

  const handleGuestsImport = async (newGuests: Array<{ name: string; email?: string; phone?: string }>) => {
    if (!eventId) {
      toast({
        variant: "destructive",
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt"
          ? "ID do evento não encontrado"
          : "Event ID not found",
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase.from("event_rsvps").insert(
        newGuests.map(guest => ({
          event_id: eventId,
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          status: "maybe",
          guests_count: 0,
          dietary_restrictions: "",
          created_at: now
        }))
      ).select();

      if (error) throw error;

      if (data) {
        setGuests((currentGuests) => [...data, ...currentGuests]);
        
        toast({
          title: language === "pt" ? "Sucesso" : "Success",
          description: language === "pt"
            ? `${data.length} convidados importados com sucesso`
            : `${data.length} guests imported successfully`,
        });
      }
    } catch (error) {
      console.error("Error importing guests:", error);
      
      toast({
        variant: "destructive",
        title: language === "pt" ? "Erro" : "Error",
        description: language === "pt"
          ? "Erro ao importar convidados. Por favor, tente novamente."
          : "Error importing guests. Please try again.",
      });
    }
  };

  const handleReminderSettings = (settings: {
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
  }) => {
    // TODO: Implementar lógica de salvamento das configurações no banco de dados
    console.log("Reminder settings:", settings);
    
    toast({
      title: language === "pt" ? "Configurações salvas" : "Settings saved",
      description: language === "pt"
        ? "As configurações de lembretes foram salvas com sucesso"
        : "Reminder settings have been saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-purple-700">
        {language === "pt" ? "Gerenciamento de Convidados" : "Guest Management"}
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {language === "pt" ? "Adicionar Convidados" : "Add Guests"}
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {language === "pt" ? "Enviar Convites" : "Send Invites"}
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {language === "pt" ? "Gerenciar Convidados" : "Manage Guests"}
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {language === "pt" ? "Lembretes Automáticos" : "Automatic Reminders"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-6">
          <GuestImport onImport={handleGuestsImport} onAdd={onAdd} />
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <InviteManager
            eventId={eventId}
            eventName={eventName}
            eventDate={eventDate}
            eventLocation={eventLocation}
            guests={guests}
          />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <GuestList eventId={eventId} guests={guests} onGuestsChange={setGuests} />
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <AutomaticReminders
            eventId={eventId}
            eventDate={eventDate}
            onSave={handleReminderSettings}
          />
        </TabsContent>
      </Tabs>

      <AddGuestDialog
        open={showAddGuest}
        onOpenChange={setShowAddGuest}
        onAdd={onAdd}
      />
    </div>
  );
};

export default GuestManagement;
