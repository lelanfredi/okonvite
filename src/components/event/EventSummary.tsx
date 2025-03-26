import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";

interface EventSummaryProps {
  eventId: string;
  eventDate?: string;
  eventName?: string;
}

export default function EventSummary({
  eventId,
  eventDate,
  eventName,
}: EventSummaryProps) {
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventDate) {
      const eventDateObj = new Date(eventDate);
      const today = new Date();
      const days = differenceInDays(eventDateObj, today);
      setDaysRemaining(days > 0 ? days : 0);
    }

    const fetchConfirmedCount = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const { count } = await supabase
          .from("event_rsvps")
          .select("id", { count: "exact" })
          .eq("event_id", eventId)
          .eq("status", "confirmed");

        setConfirmedCount(count || 0);
      } catch (error) {
        console.error("Error fetching confirmed count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedCount();

    // Set up realtime subscription for event_rsvps table
    const subscription = supabase
      .channel(`event_summary_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchConfirmedCount();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, eventDate]);

  return (
    <Card className="p-6 bg-white dark:bg-gray-800">
      <h3 className="font-semibold text-lg mb-4">Resumo do Evento</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {daysRemaining}
          </p>
          <p className="text-sm text-muted-foreground">Dias restantes</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {confirmedCount}
          </p>
          <p className="text-sm text-muted-foreground">Confirmados</p>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to={`/event/${eventId}/guests`}>Gerenciar convidados</Link>
      </Button>
    </Card>
  );
}
