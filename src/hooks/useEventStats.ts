import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface EventStats {
  confirmed: number;
  maybe: number;
  declined: number;
  totalGuests: number;
  totalWithCompanions: number;
}

interface LoadingStates {
  statistics: boolean;
}

export function useEventStats(eventId: string) {
  const [stats, setStats] = useState<EventStats>({
    confirmed: 0,
    maybe: 0,
    declined: 0,
    totalGuests: 0,
    totalWithCompanions: 0,
  });
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    statistics: true,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!eventId) return;

    try {
      setLoadingStates((prev) => ({ ...prev, statistics: true }));
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("status, guests_count")
        .eq("event_id", eventId);

      if (error) throw error;

      const newStats = {
        confirmed: 0,
        maybe: 0,
        declined: 0,
        totalGuests: 0,
        totalWithCompanions: 0,
      };

      data?.forEach((rsvp) => {
        switch (rsvp.status) {
          case "confirmed":
            newStats.confirmed++;
            break;
          case "maybe":
            newStats.maybe++;
            break;
          case "declined":
            newStats.declined++;
            break;
        }
        newStats.totalGuests++;
        newStats.totalWithCompanions += 1 + (rsvp.guests_count || 0);
      });

      setStats(newStats);
      setError(null);
    } catch (err) {
      console.error("Error fetching event stats:", err);
      setError("Erro ao carregar estatísticas");
    } finally {
      setLoadingStates((prev) => ({ ...prev, statistics: false }));
    }
  };

  useEffect(() => {
    fetchStats();

    // Configurar subscription para atualizações em tempo real
    const channel = supabase
      .channel(`event_stats_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  return { stats, loadingStates, error };
} 