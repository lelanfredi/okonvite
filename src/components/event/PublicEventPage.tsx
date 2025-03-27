import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  User,
  Check,
  Share2,
  Edit,
  BellRing,
} from "lucide-react";
import LoadingPage from "@/components/loading/LoadingPage";
import { useState } from "react";
import EventConfirmationDialog from "./EventConfirmationDialog";
import ConfirmationSuccessDialog from "./ConfirmationSuccessDialog";
import MaybeDeclineDialog from "./MaybeDeclineDialog";
import ChangeRsvpStatusDialog from "./ChangeRsvpStatusDialog";
import ShareEventDialog from "./ShareEventDialog";
import ReminderSettingsDialog from "./ReminderSettingsDialog";
import { NotificationService } from "./NotificationService";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  event_settings?: any;
  rsvp_deadline?: string;
}

import { setPageTitle } from "@/lib/utils/page-title";

export default function PublicEventPage() {
  useEffect(() => {
    setPageTitle("Evento");
  }, []);
  const { id } = useParams();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showMaybeDeclineDialog, setShowMaybeDeclineDialog] = useState(false);
  const [responseType, setResponseType] = useState<"maybe" | "declined">();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [userRsvpStatus, setUserRsvpStatus] = useState<string | null>(null);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  useEffect(() => {
    const checkConfirmationStatus = async () => {
      if (!id) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Check user's RSVP status
          const { data: rsvp } = await supabase
            .from("event_rsvps")
            .select("status")
            .eq("event_id", id)
            .eq("user_id", user.id)
            .single();

          if (rsvp) {
            setUserRsvpStatus(rsvp.status);
            if (rsvp.status === "confirmed") {
              setIsConfirmed(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking confirmation status:", error);
      }
    };

    checkConfirmationStatus();
  }, [id]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching event with ID:", id);
        const { data: event, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching event:", error);
          setLoading(false);
          return;
        }

        console.log("Event data received:", event);
        if (event) {
          setEvent(event);
        } else {
          console.log("No event found with ID:", id);
        }
      } catch (err) {
        console.error("Exception fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <LoadingPage message="Carregando" />;
  }

  if (!event) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-2">Evento não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          O evento solicitado não existe ou foi removido.
        </p>
        <Button onClick={() => (window.location.href = "/")}>
          Voltar para a página inicial
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a
            href="/"
            className="text-xl font-bold text-primary hover:opacity-90 transition-opacity"
          >
            Konvite
          </a>

          {userRsvpStatus && (
            <div className="flex items-center gap-2">
              {userRsvpStatus === "confirmed" && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Presença confirmada
                </div>
              )}
              {userRsvpStatus === "maybe" && (
                <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  Talvez
                </div>
              )}
              {userRsvpStatus === "declined" && (
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  Não comparecerei
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowReminderSettings(true)}
                >
                  <BellRing className="h-4 w-4" />
                  Lembretes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowChangeStatus(true)}
                >
                  <Edit className="h-4 w-4" />
                  Alterar resposta
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            {/* Event Image */}
            <div className="relative bg-muted max-h-[300px] overflow-hidden">
              <img
                src={
                  event.image_url ||
                  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
                }
                alt={event.title}
                className="w-full h-[300px] object-cover"
              />
            </div>

            {/* Event Details */}
            <div className="p-8">
              {isConfirmed && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5" />
                    Informações para confirmados
                  </h3>
                  <p className="text-green-700 text-sm">
                    Você confirmou sua presença neste evento. Aqui estão algumas
                    informações adicionais:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-green-700">
                    <li>• Estacionamento disponível no local</li>
                    <li>• Traje: Casual</li>
                    <li>• Contato do organizador: (11) 99999-9999</li>
                  </ul>
                </div>
              )}
              <div className="flex justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold flex-1">{event.title}</h1>
                <div className="flex gap-2">
                  {userRsvpStatus ? (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowShareDialog(true)}
                      className="shrink-0 flex items-center gap-2"
                    >
                      <Share2 className="h-5 w-5" />
                      Compartilhar
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => setShowConfirmation(true)}
                      className="shrink-0"
                    >
                      Confirmar Presença
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-2 text-lg mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })} • {event.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>

              {event.description && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4">Sobre o evento</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      <EventConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={new Date(event.date)}
        eventTime={event.time}
        eventLocation={event.location}
        onSuccess={() => setShowSuccessDialog(true)}
      />

      <ConfirmationSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        eventDetails={{
          title: event.title,
          date: new Date(event.date),
          time: event.time,
          location: event.location,
        }}
        onViewEvent={() => {
          setShowSuccessDialog(false);
          // Refresh the page to show authenticated view
          window.location.reload();
        }}
        onAddToCalendar={(type) => {
          // Generate calendar links
          const eventTitle = encodeURIComponent(event.title);
          const eventStart = new Date(`${event.date}T${event.time}`);
          const eventEnd = new Date(eventStart.getTime() + 3 * 60 * 60 * 1000); // Default 3 hours
          const eventLocation = encodeURIComponent(event.location);
          const eventDescription = encodeURIComponent(event.description || "");

          // Format dates for calendar
          const formatDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, "");
          };

          const startDate = formatDate(eventStart);
          const endDate = formatDate(eventEnd);

          let calendarUrl = "";

          if (type === "google") {
            calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${eventDescription}&location=${eventLocation}&sf=true&output=xml`;
          } else if (type === "outlook") {
            calendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventTitle}&startdt=${eventStart.toISOString()}&enddt=${eventEnd.toISOString()}&body=${eventDescription}&location=${eventLocation}`;
          } else if (type === "apple") {
            // Apple Calendar uses the same format as Google Calendar
            calendarUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${startDate}\nDTEND:${endDate}\nSUMMARY:${eventTitle}\nLOCATION:${eventLocation}\nDESCRIPTION:${eventDescription}\nEND:VEVENT\nEND:VCALENDAR`;
          }

          if (calendarUrl) {
            window.open(calendarUrl, "_blank");
          }
        }}
      />

      <MaybeDeclineDialog
        open={showMaybeDeclineDialog}
        onOpenChange={setShowMaybeDeclineDialog}
        responseType={responseType || "maybe"}
        eventTitle={event?.title || ""}
        eventDate={new Date(event?.date || new Date())}
        onContinue={() => {
          setShowMaybeDeclineDialog(false);
          // Refresh the page to show updated status
          window.location.reload();
        }}
        onAddReminder={(shouldRemind) => {
          if (shouldRemind) {
            // In a real app, you would save this preference to the database
            console.log("User wants a reminder for event:", event?.id);
          }
        }}
        onSendMessage={(message) => {
          // In a real app, you would save this message to the database
          console.log("Message to host:", message);
        }}
      />

      <ChangeRsvpStatusDialog
        open={showChangeStatus}
        onOpenChange={setShowChangeStatus}
        eventId={event?.id || ""}
        currentStatus={userRsvpStatus || ""}
        eventDetails={{
          title: event?.title || "",
          date: new Date(event?.date || new Date()),
          rsvpDeadline: event?.rsvp_deadline
            ? new Date(event.rsvp_deadline)
            : undefined,
        }}
        onStatusChanged={() => {
          // Refresh the page to show updated status
          window.location.reload();
        }}
      />

      <ShareEventDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        eventId={event?.id || ""}
        eventTitle={event?.title || ""}
        eventUrl={window.location.href}
      />

      <ReminderSettingsDialog
        open={showReminderSettings}
        onOpenChange={setShowReminderSettings}
        eventId={event?.id || ""}
      />
    </div>
  );
}
