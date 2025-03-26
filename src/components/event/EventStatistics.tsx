import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Check, HelpCircle, X, Users } from "lucide-react";

interface EventStatisticsProps {
  eventId: string;
}

export default function EventStatistics({ eventId }: EventStatisticsProps) {
  const [stats, setStats] = useState({
    confirmed: 0,
    maybe: 0,
    declined: 0,
    totalGuests: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Get confirmed count
      const { count: confirmed } = await supabase
        .from("event_rsvps")
        .select("id", { count: "exact" })
        .eq("event_id", eventId)
        .eq("status", "confirmed");

      // Get maybe count
      const { count: maybe } = await supabase
        .from("event_rsvps")
        .select("id", { count: "exact" })
        .eq("event_id", eventId)
        .eq("status", "maybe");

      // Get declined count
      const { count: declined } = await supabase
        .from("event_rsvps")
        .select("id", { count: "exact" })
        .eq("event_id", eventId)
        .eq("status", "declined");

      // Get total guests (including plus ones)
      const { data: guestsData } = await supabase
        .from("event_rsvps")
        .select("guests_count")
        .eq("event_id", eventId)
        .eq("status", "confirmed");

      const totalGuests = guestsData?.reduce((sum, item) => {
        return sum + (item.guests_count || 0);
      }, 0);

      setStats({
        confirmed: confirmed || 0,
        maybe: maybe || 0,
        declined: declined || 0,
        totalGuests: (confirmed || 0) + (totalGuests || 0),
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();

    // Set up realtime subscription for event_rsvps table
    const subscription = supabase
      .channel("event_rsvps_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("Realtime update:", payload);
          fetchStatistics();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId]);

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-lg">Estatísticas do Evento</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.confirmed}
          </p>
          <p className="text-sm text-muted-foreground">Confirmados</p>
        </div>

        <div className="bg-amber-100 dark:bg-amber-900/20 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <HelpCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats.maybe}
          </p>
          <p className="text-sm text-muted-foreground">Talvez</p>
        </div>

        <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <X className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {stats.declined}
          </p>
          <p className="text-sm text-muted-foreground">Recusados</p>
        </div>

        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalGuests}
          </p>
          <p className="text-sm text-muted-foreground">Total de Pessoas</p>
        </div>
      </div>
    </Card>
  );
}
