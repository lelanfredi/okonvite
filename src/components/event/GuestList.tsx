import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  guests_count: number;
  dietary_restrictions?: string;
  created_at?: string;
  updated_at?: string;
}

interface GuestListProps {
  eventId: string;
  onSendMessage?: (guests: Guest[]) => void;
}

const GuestList = ({ eventId, onSendMessage }: GuestListProps) => {
  const { language } = useI18n();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGuests = async () => {
    if (!eventId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("event_rsvps")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching guests:", error);
    } else {
      setGuests(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGuests();

    // Set up realtime subscription
    const channel = supabase
      .channel(`event_rsvps_changes_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          fetchGuests();
        },
      )
      .subscribe();

    console.log(`Subscribed to realtime updates for event ${eventId}`);

    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests((prev) => {
      if (prev.includes(guestId)) {
        return prev.filter((id) => id !== guestId);
      } else {
        return [...prev, guestId];
      }
    });
  };

  const handleSendMessage = () => {
    const guestsToMessage = guests.filter((guest) =>
      selectedGuests.includes(guest.id),
    );
    if (onSendMessage) {
      onSendMessage(guestsToMessage);
    }
  };

  const updateGuestStatus = async (guestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("event_rsvps")
        .update({ status })
        .eq("id", guestId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating guest status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        {language === "pt" ? "Carregando convidados..." : "Loading guests..."}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg">
      {guests.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="font-medium">{guests.length}</span>{" "}
              {language === "pt" ? "convidados" : "guests"}
            </div>
            {selectedGuests.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendMessage}
                  className="flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  {language === "pt" ? "Enviar mensagem" : "Send message"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  {language === "pt" ? "WhatsApp" : "WhatsApp"}
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="h-[300px] w-full pr-4">
            <div className="space-y-3">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className={`p-3 border rounded-lg flex items-center justify-between ${selectedGuests.includes(guest.id) ? "bg-primary/10 border-primary/30" : "bg-card"}`}
                  onClick={() => toggleGuestSelection(guest.id)}
                >
                  <div className="flex-1">
                    <p className="font-semibold">{guest.name}</p>
                    {guest.email && (
                      <p className="text-sm text-muted-foreground">
                        {guest.email}
                      </p>
                    )}
                    {guest.phone && (
                      <p className="text-sm text-muted-foreground">
                        {guest.phone}
                      </p>
                    )}
                    {guest.guests_count > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        +{guest.guests_count}{" "}
                        {language === "pt" ? "acompanhante" : "companion"}
                        {guest.guests_count > 1 ? "s" : ""}
                      </p>
                    )}
                    {guest.dietary_restrictions && (
                      <Badge variant="secondary" className="mt-1">
                        {guest.dietary_restrictions}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button
                      size="sm"
                      variant={
                        guest.status === "confirmed" ? "default" : "outline"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        updateGuestStatus(guest.id, "confirmed");
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        guest.status === "declined" ? "destructive" : "outline"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        updateGuestStatus(guest.id, "declined");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {language === "pt"
            ? "Nenhum convidado adicionado ainda"
            : "No guests added yet"}
        </div>
      )}
    </div>
  );
};

export default GuestList;
