import { useState } from "react";
import { Card } from "@/components/ui/card";
import InviteMethods from "./InviteMethods";
import InviteMessage from "./InviteMessage";
import ShareAndReminders from "./ShareAndReminders";
import { Separator } from "@/components/ui/separator";

interface InviteManagerProps {
  eventId: string;
  eventName: string;
  eventDate: Date;
  eventLocation: string;
  guests: Array<{ name: string; email?: string; phone?: string }>;
}

export default function InviteManager({
  eventId,
  eventName,
  eventDate,
  eventLocation,
  guests,
}: InviteManagerProps) {
  const [inviteMessage, setInviteMessage] = useState("");

  const handleRemindersChange = (settings: {
    enabled: boolean;
    frequency: "once" | "daily" | "weekly";
    daysBeforeEvent: number;
    messageTemplate: string;
  }) => {
    // Implementar lógica de lembretes
    console.log("Reminder settings:", settings);
  };

  return (
    <Card className="p-6 space-y-6">
      <InviteMethods
        eventId={eventId}
        guests={guests}
        inviteMessage={inviteMessage}
      />
      
      <Separator />
      
      <InviteMessage
        eventName={eventName}
        eventDate={eventDate}
        eventLocation={eventLocation}
        onChange={setInviteMessage}
      />
      
      <Separator />
      
      <ShareAndReminders
        eventId={eventId}
      />
    </Card>
  );
} 