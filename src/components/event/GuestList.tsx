import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, MessageSquare, HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useEventStats } from "@/hooks/useEventStats";

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
  eventId?: string;
  guests: Guest[];
  onGuestsChange?: (guests: Guest[]) => void;
  onSendMessage?: (guests: Guest[]) => void;
}

const GuestList = ({ eventId, guests, onGuestsChange, onSendMessage }: GuestListProps) => {
  const { language } = useI18n();
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { stats } = useEventStats(eventId);

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests((prev) => {
      if (prev.includes(guestId)) {
        return prev.filter((id) => id !== guestId);
      } else {
        return [...prev, guestId];
      }
    });
  };

  const updateGuestStatus = async (guestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("event_rsvps")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", guestId);

      if (error) throw error;

      // Atualizar a lista local
      if (onGuestsChange) {
        const updatedGuests = guests.map(guest => 
          guest.id === guestId ? { ...guest, status } : guest
        );
        onGuestsChange(updatedGuests);
      }
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
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="text-sm">
                  <span className="font-medium">{stats?.totalGuests || guests.length}</span>{" "}
                  {language === "pt" ? "convidados" : "guests"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{stats?.totalWithCompanions || guests.length}</span>{" "}
                  {language === "pt" ? "pessoas no total" : "people in total"}
                </div>
              </div>
              {selectedGuests.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSendMessage?.(guests.filter(g => selectedGuests.includes(g.id || '')))}
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
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                <span>{stats?.confirmed || guests.filter(g => g.status === 'confirmed').length}</span>{" "}
                {language === "pt" ? "confirmados" : "confirmed"}
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <HelpCircle className="w-4 h-4" />
                <span>{stats?.maybe || guests.filter(g => g.status === 'maybe').length}</span>{" "}
                {language === "pt" ? "talvez" : "maybe"}
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <X className="w-4 h-4" />
                <span>{stats?.declined || guests.filter(g => g.status === 'declined').length}</span>{" "}
                {language === "pt" ? "recusados" : "declined"}
              </div>
            </div>
          </div>

          <ScrollArea className="h-[300px] w-full pr-4">
            <div className="space-y-3">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className={`p-3 border rounded-lg flex items-center justify-between ${selectedGuests.includes(guest.id || '') ? "bg-primary/10 border-primary/30" : "bg-card"}`}
                  onClick={() => guest.id && toggleGuestSelection(guest.id)}
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
                        guest.id && updateGuestStatus(guest.id, "confirmed");
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        guest.status === "maybe" ? "default" : "outline"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        guest.id && updateGuestStatus(guest.id, "maybe");
                      }}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        guest.status === "declined" ? "destructive" : "outline"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        guest.id && updateGuestStatus(guest.id, "declined");
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
