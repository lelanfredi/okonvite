import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Cake, Building2, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";

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
      <h2 className="text-2xl font-semibold mb-6">Escolha o tipo do evento</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {eventTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer p-6 h-full ${selectedType === type.id ? "border-primary border-2" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(type.id);
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  {type.icon}
                </div>
                <h3 className="text-xl font-medium">{type.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {type.description}
                </p>
                <Button
                  variant={selectedType === type.id ? "default" : "outline"}
                  className="mt-4"
                >
                  {selectedType === type.id ? "Selecionado" : "Selecionar"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventTypeSelector;
