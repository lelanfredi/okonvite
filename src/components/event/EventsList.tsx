import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import LoadingPage from "@/components/loading/LoadingPage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  short_id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (events) {
        setEvents(events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Eventos</h1>
        <Button onClick={() => navigate("/new")} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Criar Evento
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Nenhum evento criado</h2>
          <p className="text-muted-foreground mb-4">
            Comece criando seu primeiro evento!
          </p>
          <Button onClick={() => navigate("/new")} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Evento
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className="h-48 bg-muted relative">
                <img
                  src={
                    event.image_url ||
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR })} • {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/e/${event.short_id}`, "_blank");
                    }}
                  >
                    Ver Página do Evento ↗
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
