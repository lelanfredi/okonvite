import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Check, HelpCircle, X } from "lucide-react";
import { useEventStats } from "@/hooks/useEventStats";
import { CardSkeleton, StatsSkeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface EventDashboardProps {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  onManageGuests: () => void;
}

// Componente memoizado para o card de status
const StatusCard = memo(
  ({
    status,
    count,
    icon: Icon,
    color,
  }: {
    status: string;
    count: number;
    icon: any;
    color: string;
  }) => (
    <div className={`bg-${color}-100 dark:bg-${color}-900/20 rounded-lg p-4 text-center`}>
      <div className="flex justify-center mb-2">
        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>
        {count}
      </p>
      <p className="text-sm text-muted-foreground">{status}</p>
    </div>
  )
);

StatusCard.displayName = "StatusCard";

export default function EventDashboard({
  eventId,
  eventTitle,
  eventDate,
  onManageGuests,
}: EventDashboardProps) {
  const { stats, loadingStates, error } = useEventStats(eventId);

  const daysRemaining = useMemo(() => {
    return Math.max(
      0,
      Math.ceil(
        (new Date(eventDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  }, [eventDate]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Principal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Resumo do Evento</h3>
          <Button variant="outline" onClick={onManageGuests}>
            Gerenciar Convidados
          </Button>
        </div>

        {loadingStates.summary ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{daysRemaining}</p>
              <p className="text-sm text-muted-foreground">Dias restantes</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">
                {stats.totalGuests}
              </p>
              <p className="text-sm text-muted-foreground">Total de Pessoas</p>
            </div>
          </div>
        )}
      </Card>

      {/* Estatísticas Detalhadas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status dos Convidados</h3>
        {loadingStates.statistics ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <StatusCard
              status="Confirmados"
              count={stats.confirmed}
              icon={Check}
              color="green"
            />
            <StatusCard
              status="Talvez"
              count={stats.maybe}
              icon={HelpCircle}
              color="amber"
            />
            <StatusCard
              status="Recusados"
              count={stats.declined}
              icon={X}
              color="red"
            />
          </div>
        )}
      </Card>
    </div>
  );
} 