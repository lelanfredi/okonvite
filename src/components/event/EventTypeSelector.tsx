import React from "react";
import { Card } from "../ui/card";
import { Cake, Building2, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EventType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface EventTypeSelectorProps {
  onSelect?: (eventType: string) => void;
  selectedType?: string;
}

const eventTypes: EventType[] = [
  {
    id: "birthday",
    title: "Festa de Aniversário",
    description:
      "Perfeito para celebrar momentos especiais com amigos e família",
    icon: <Cake className="h-8 w-8" />,
  },
  {
    id: "corporate",
    title: "Evento Corporativo",
    description: "Eventos profissionais para networking e negócios",
    icon: <Building2 className="h-8 w-8" />,
  },
  {
    id: "theme",
    title: "Festa Temática",
    description: "Comemorações temáticas para qualquer ocasião",
    icon: <PartyPopper className="h-8 w-8" />,
  },
];

const EventTypeSelector = ({
  onSelect = (type: string) => {},
  selectedType = "",
}: EventTypeSelectorProps) => {
  return (
    <div className="w-full bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-semibold text-purple-700 mb-6">Escolha o tipo do evento</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {eventTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                "cursor-pointer p-6 h-full transition-all duration-200 hover:shadow-md",
                selectedType === type.id
                  ? "bg-purple-50 border-purple-500 border-2 shadow-purple-100"
                  : "hover:border-purple-200"
              )}
              onClick={() => onSelect(type.id)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={cn(
                  "p-3 rounded-full transition-colors duration-200",
                  selectedType === type.id
                    ? "bg-purple-100"
                    : "bg-purple-50"
                )}>
                  <div className={cn(
                    "transition-colors duration-200",
                    selectedType === type.id
                      ? "text-purple-600"
                      : "text-purple-400"
                  )}>
                    {type.icon}
                  </div>
                </div>
                <h3 className={cn(
                  "text-xl font-medium transition-colors duration-200",
                  selectedType === type.id
                    ? "text-purple-700"
                    : "text-gray-700"
                )}>
                  {type.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {type.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventTypeSelector;
