import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Share2, Calendar, Settings, Send } from "lucide-react";
import EventStatistics from "./EventStatistics";
import EventManagementDialog from "./EventManagementDialog";
import GuestManagement from "./GuestManagement";
import ShareInvites from "./ShareInvites";
import SendMessageDialog from "./SendMessageDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import LoadingPage from "@/components/loading/LoadingPage";
import EventDashboard from "./EventDashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventManagementButtons } from "./EventManagementButtons";

interface EventPageProps {
  event: {
    title: string;
    description?: string;
    date: Date;
    time: string;
    location: string;
    organizer: {
      name: string;
      email: string;
    };
  };
}

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { setPageTitle } from "@/lib/utils/page-title";

export default function EventPage() {
  useEffect(() => {
    setPageTitle("Gerenciar Evento");
  }, []);
  const { shortId } = useParams();
  const [event, setEvent] = useState<
    EventPageProps["event"] & { 
      confirmedGuests?: number;
      short_id?: string;
      id?: string;
    }
  >();
  const [loading, setLoading] = useState(true);
  const [showGuestManagement, setShowGuestManagement] = useState(false);
  const [showShareInvites, setShowShareInvites] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);

  const fetchEvent = async () => {
    if (!shortId) return;

    const { data: event } = await supabase
      .from("events")
      .select(
        `
        *,
        event_settings (*),
        event_co_organizers (*)
      `,
      )
      .eq("short_id", shortId)
      .single();

    // Get confirmed guests count
    const { count: confirmedGuests } = await supabase
      .from("event_rsvps")
      .select("id", { count: "exact" })
      .eq("event_id", event.id)
      .eq("status", "confirmed");

    if (event) {
      setEvent({
        title: event.title,
        description: event.description,
        date: new Date(event.date),
        time: event.time,
        location: event.location,
        is_private: event.is_private,
        image_url: event.image_url,
        settings: event.event_settings,
        co_organizers: event.event_co_organizers,
        confirmedGuests: confirmedGuests || 0,
        short_id: event.short_id,
        id: event.id,
        organizer: {
          name: "Você",
          email: "seu@email.com",
        },
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, [shortId]);

  if (loading) {
    return <LoadingPage message="Carregando" />;
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Evento não encontrado
      </div>
    );
  }

  const handleInviteGuests = () => {
    // Implementar lógica para convidar convidados
    console.log("Convidar convidados");
  };

  const handleSendMessage = () => {
    // Implementar lógica para enviar comunicado
    console.log("Enviar comunicado");
  };

  const handleShare = () => {
    // Implementar lógica para compartilhar evento
    console.log("Compartilhar evento");
  };

  const handleManage = () => {
    // Implementar lógica para gerenciar evento
    console.log("Gerenciar evento");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <Header>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/e/${event.short_id}`, "_blank")}
          >
            Página do Evento ↗
          </Button>
        </div>
      </Header>

      {/* Banner Image */}
      <div className="w-full h-[300px] bg-muted relative mt-16">
        <img
          src={
            event.image_url ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
          }
          alt="Event cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Event Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <h1 className="text-xl font-semibold">{event.title}</h1>
          </div>
        </div>
      </header>

      {/* Management Buttons */}
      <div className="container mx-auto px-4 py-6 border-b">
        <EventManagementButtons
          onInviteGuests={() => setShowGuestManagement(true)}
          onSendMessage={() => setShowSendMessage(true)}
          onShare={() => setShowShareInvites(true)}
          onManage={() => setShowManagement(true)}
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Event Details Card */}
          <Card className="col-span-2 p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">{event.title}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(event.date, "dd/MM/yyyy", { locale: ptBR })} • {event.time}
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.location}
                </p>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}
            </div>
          </Card>

          {/* Event Dashboard */}
          <EventDashboard
            eventId={event.id}
            eventTitle={event.title}
            eventDate={event.date}
            onManageGuests={() => setShowGuestManagement(true)}
          />
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={showGuestManagement} onOpenChange={setShowGuestManagement}>
        <DialogContent className="max-w-4xl">
          <GuestManagement eventId={event.id} />
        </DialogContent>
      </Dialog>

      <Dialog open={showShareInvites} onOpenChange={setShowShareInvites}>
        <DialogContent className="max-w-4xl">
          <ShareInvites
            eventId={event.id}
            saveTheDate={{
              message:
                event?.description ||
                "Você está convidado para um evento especial!",
            }}
          />
        </DialogContent>
      </Dialog>

      <SendMessageDialog
        open={showSendMessage}
        onOpenChange={setShowSendMessage}
        eventId={event.id}
      />

      <EventManagementDialog
        open={showManagement}
        onOpenChange={setShowManagement}
        onSave={fetchEvent}
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          is_private: event.is_private,
          image_url: event.image_url,
        }}
      />
    </div>
  );
}
