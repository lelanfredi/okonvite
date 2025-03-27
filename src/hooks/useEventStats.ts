import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { debounce } from "lodash";

interface EventStats {
  confirmed: number;
  maybe: number;
  declined: number;
  totalGuests: number;
}

interface CachedStats {
  data: EventStats;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useEventStats(eventId: string) {
  const [stats, setStats] = useState<EventStats>({
    confirmed: 0,
    maybe: 0,
    declined: 0,
    totalGuests: 0,
  });
  const [cachedStats, setCachedStats] = useState<CachedStats | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    summary: true,
    statistics: true,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!eventId) return;

    // Verificar cache
    if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_DURATION) {
      setStats(cachedStats.data);
      setLoadingStates({ summary: false, statistics: false });
      return;
    }

    try {
      setLoadingStates({ summary: true, statistics: true });
      setError(null);

      // Fazer uma única query com agregação
      const { data, error } = await supabase
        .from("event_rsvps")
        .select(`
          status,
          guests_count
        `)
        .eq("event_id", eventId);

      if (error) throw error;

      // Calcular estatísticas
      const newStats = data.reduce(
        (acc, item) => {
          acc[item.status]++;
          if (item.status === "confirmed") {
            acc.totalGuests += (item.guests_count || 0) + 1;
          }
          return acc;
        },
        { confirmed: 0, maybe: 0, declined: 0, totalGuests: 0 }
      );

      // Atualizar cache
      setCachedStats({
        data: newStats,
        timestamp: Date.now(),
      });

      setStats(newStats);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Erro ao carregar estatísticas");
    } finally {
      setLoadingStates({ summary: false, statistics: false });
    }
  }, [eventId, cachedStats]);

  // Debounce para evitar múltiplas chamadas
  const debouncedFetch = useMemo(
    () => debounce(fetchStatistics, 500),
    [fetchStatistics]
  );

  useEffect(() => {
    fetchStatistics();

    // Configurar subscription otimizada
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
          if (payload.eventType === "INSERT") {
            setStats((prev) => ({
              ...prev,
              [payload.new.status]: prev[payload.new.status] + 1,
              totalGuests:
                payload.new.status === "confirmed"
                  ? prev.totalGuests + (payload.new.guests_count || 0) + 1
                  : prev.totalGuests,
            }));
          } else if (payload.eventType === "UPDATE") {
            setStats((prev) => ({
              ...prev,
              [payload.old.status]: prev[payload.old.status] - 1,
              [payload.new.status]: prev[payload.new.status] + 1,
              totalGuests:
                payload.new.status === "confirmed"
                  ? prev.totalGuests -
                    (payload.old.guests_count || 0) +
                    (payload.new.guests_count || 0)
                  : prev.totalGuests,
            }));
          } else if (payload.eventType === "DELETE") {
            setStats((prev) => ({
              ...prev,
              [payload.old.status]: prev[payload.old.status] - 1,
              totalGuests:
                payload.old.status === "confirmed"
                  ? prev.totalGuests - (payload.old.guests_count || 0) - 1
                  : prev.totalGuests,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      debouncedFetch.cancel();
    };
  }, [eventId, debouncedFetch]);

  return {
    stats,
    loadingStates,
    error,
    refetch: fetchStatistics,
  };
} 