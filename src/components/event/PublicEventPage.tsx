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
import { useState, useEffect } from "react";
import EventConfirmationDialog from "./EventConfirmationDialog";
import ConfirmationSuccessDialog from "./ConfirmationSuccessDialog";
import MaybeDeclineDialog from "./MaybeDeclineDialog";
import ChangeRsvpStatusDialog from "./ChangeRsvpStatusDialog";
import ShareEventDialog from "./ShareEventDialog";
import ReminderSettingsDialog from "./ReminderSettingsDialog";
import { NotificationService } from "./NotificationService";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import RsvpButton from "./RsvpButton";
import RsvpDialog from "./RsvpDialog";

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
  const { shortId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!shortId) return;

      const { data: event, error } = await supabase
        .from("events")
        .select(`
          *,
          event_settings (*)
        `)
        .eq("short_id", shortId)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        setLoading(false);
        return;
      }

      if (event) {
        setEvent(event);
      }
      setLoading(false);
    };

    fetchEvent();
  }, [shortId]);

  if (loading) {
    return <LoadingPage message="Carregando evento..." />;
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-center text-red-600">
          Evento não encontrado
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {event.image_url && (
        <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">{event.title}</h1>
          <p className="text-gray-600 mt-2">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-purple-700">Data e Hora</h2>
              <p className="text-gray-700">
                {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                {" às "}
                {event.time}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-purple-700">Local</h2>
              <p className="text-gray-700">{event.location}</p>
            </div>
          </div>

          <div className="space-y-4">
            <RsvpButton onClick={() => setShowRsvpDialog(true)} />
          </div>
        </div>
      </div>

      <RsvpDialog
        open={showRsvpDialog}
        onOpenChange={setShowRsvpDialog}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={new Date(event.date)}
        onSuccess={() => {
          // Aqui você pode atualizar a UI ou mostrar uma mensagem de sucesso
        }}
      />
    </div>
  );
}
