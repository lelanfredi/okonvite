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
  const { id } = useParams();
  const [event, setEvent] = useState<
    EventPageProps["event"] & { confirmedGuests?: number }
  >();
  const [loading, setLoading] = useState(true);
  const [showGuestManagement, setShowGuestManagement] = useState(false);
  const [showShareInvites, setShowShareInvites] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);

  const fetchEvent = async () => {
    if (!id) return;

    const { data: event } = await supabase
      .from("events")
      .select(
        `
        *,
        event_settings (*),
        event_co_organizers (*)
      `,
      )
      .eq("id", id)
      .single();

    // Get confirmed guests count
    const { count: confirmedGuests } = await supabase
      .from("event_rsvps")
      .select("id", { count: "exact" })
      .eq("event_id", id)
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
  }, [id]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <Header />

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/evento/${id}`, "_blank")}
          >
            Página do Evento ↗
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowGuestManagement(true)}
            >
              <MessageSquare className="w-4 h-4" />
              Convidar Convidados
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowSendMessage(true)}
            >
              <Send className="w-4 h-4" />
              Enviar Comunicado
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowShareInvites(true)}
            >
              <Share2 className="w-4 h-4" />
              Compartilhar Evento
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowManagement(true)}
            >
              <Settings className="w-4 h-4" />
              Gerenciar evento
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8">
          {/* Event Details Card */}
          <Card className="col-span-2 p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">{event.title}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {event.date.toLocaleDateString("pt-BR")} • {event.time}
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

          {/* Event Summary Dashboard */}
          <div className="space-y-8">
            <Card className="p-6 space-y-4 h-fit">
              <h3 className="font-semibold">Resumo do Evento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(event.date).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dias restantes
                  </p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {event.confirmedGuests || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Confirmados</p>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setShowGuestManagement(true)}
                >
                  Gerenciar convidados
                </Button>
              </div>
            </Card>

            {/* Event Statistics */}
            <EventStatistics eventId={id} />
          </div>
        </div>
      </main>

      <Dialog open={showGuestManagement} onOpenChange={setShowGuestManagement}>
        <DialogContent className="max-w-4xl">
          <GuestManagement eventId={id} />
        </DialogContent>
      </Dialog>

      <Dialog open={showShareInvites} onOpenChange={setShowShareInvites}>
        <DialogContent className="max-w-4xl">
          <ShareInvites
            eventId={id}
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
        eventId={id}
      />

      <EventManagementDialog
        open={showManagement}
        onOpenChange={setShowManagement}
        onSave={fetchEvent}
        event={{
          id: id,
          title: event.title,
          description: event.description,
          date: new Date(event.date),
          time: event.time,
          location: event.location,
          is_private: event.is_private,
          image_url: event.image_url,
        }}
      />
    </div>
  );
}
