import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Clock, MapPin, Calendar, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ConfirmationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventDetails: {
    title: string;
    date: Date;
    time: string;
    location: string;
  };
  onViewEvent: () => void;
  onAddToCalendar: (type: "google" | "apple" | "outlook") => void;
}

export default function ConfirmationSuccessDialog({
  open,
  onOpenChange,
  eventDetails,
  onViewEvent,
  onAddToCalendar,
}: ConfirmationSuccessDialogProps) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {eventDetails.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center">
          {/* Success Animation */}
          <div className="mb-6 relative h-24 w-24">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-green-100 rounded-full flex items-center justify-center"
              onAnimationComplete={() => setIsAnimationComplete(true)}
            >
              <Check className="h-12 w-12 text-green-600" />
            </motion.div>
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center space-y-6"
          >
            <h3 className="text-2xl font-bold text-green-600">
              Obrigado por confirmar sua presença!
            </h3>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span>{formatDate(eventDetails.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>{eventDetails.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{eventDetails.location}</span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                className="w-full flex items-center gap-2 justify-center"
                onClick={() => onAddToCalendar("google")}
              >
                <Calendar className="h-4 w-4" />
                Adicionar ao Google Calendar
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-1 justify-center"
                  onClick={() => onAddToCalendar("apple")}
                >
                  <Calendar className="h-4 w-4" />
                  Apple
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-1 justify-center"
                  onClick={() => onAddToCalendar("outlook")}
                >
                  <Calendar className="h-4 w-4" />
                  Outlook
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={onViewEvent}
              >
                Ver página do evento
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
