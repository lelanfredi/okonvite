import { supabase } from "@/lib/supabase";

interface EventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
}

interface UserDetails {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface NotificationOptions {
  type: "confirmation" | "reminder_1day" | "reminder_7day" | "update";
  channels: ("email" | "whatsapp")[];
  updateMessage?: string;
}

export class NotificationService {
  /**
   * Send a confirmation notification after RSVP
   */
  static async sendConfirmation(
    eventDetails: EventDetails,
    userDetails: UserDetails,
    channels: ("email" | "whatsapp")[] = ["email"],
  ) {
    return this.sendNotification(eventDetails, userDetails, {
      type: "confirmation",
      channels,
    });
  }

  /**
   * Send a reminder notification
   */
  static async sendReminder(
    eventDetails: EventDetails,
    userDetails: UserDetails,
    daysRemaining: 1 | 7,
    channels: ("email" | "whatsapp")[] = ["email"],
  ) {
    return this.sendNotification(eventDetails, userDetails, {
      type: daysRemaining === 1 ? "reminder_1day" : "reminder_7day",
      channels,
    });
  }

  /**
   * Send an update notification
   */
  static async sendUpdateNotification(
    eventDetails: EventDetails,
    userDetails: UserDetails,
    updateMessage: string,
    channels: ("email" | "whatsapp")[] = ["email"],
  ) {
    return this.sendNotification(eventDetails, userDetails, {
      type: "update",
      channels,
      updateMessage,
    });
  }

  /**
   * Core notification sending method
   */
  private static async sendNotification(
    eventDetails: EventDetails,
    userDetails: UserDetails,
    options: NotificationOptions,
  ) {
    const { type, channels, updateMessage } = options;
    const eventUrl = `${window.location.origin}/evento/${eventDetails.id}`;

    // Generate QR code token if it's a confirmation
    let qrCodeToken = null;
    if (type === "confirmation") {
      qrCodeToken = this.generateQRCodeToken(eventDetails.id, userDetails.id);

      // Update the RSVP with the QR code token
      try {
        const { data: rsvp } = await supabase
          .from("event_rsvps")
          .select("id")
          .eq("event_id", eventDetails.id)
          .eq("user_id", userDetails.id)
          .single();

        if (rsvp) {
          await supabase
            .from("event_rsvps")
            .update({ qr_code_token: qrCodeToken })
            .eq("id", rsvp.id);
        }
      } catch (error) {
        console.error("Error updating QR code token:", error);
      }
    }

    // Process each channel
    for (const channel of channels) {
      try {
        let status = "sent";
        let messageId = null;
        let metadata = {};

        if (channel === "email") {
          // In a real app, this would call an email service
          // For now, we'll just log it
          console.log(`Sending ${type} email to ${userDetails.email}`);

          // Here you would integrate with an email service like SendGrid, Mailgun, etc.
          // const emailResult = await emailService.send(...);
          // messageId = emailResult.messageId;

          // For demo purposes
          messageId = `email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        } else if (channel === "whatsapp") {
          // In a real app, this would call a WhatsApp API
          // For now, we'll just log it
          console.log(`Sending ${type} WhatsApp to ${userDetails.phone}`);

          // Here you would integrate with a WhatsApp API like Twilio, MessageBird, etc.
          // const whatsappResult = await whatsappService.send(...);
          // messageId = whatsappResult.messageId;

          // For demo purposes
          messageId = `whatsapp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }

        // Record the notification in the database
        await supabase.from("event_notifications").insert({
          event_id: eventDetails.id,
          user_id: userDetails.id,
          notification_type: type,
          channel,
          status,
          message_id: messageId,
          metadata: {
            ...metadata,
            qr_code_token: qrCodeToken,
            update_message: updateMessage,
          },
        });
      } catch (error) {
        console.error(`Error sending ${channel} notification:`, error);

        // Record the failed notification
        await supabase.from("event_notifications").insert({
          event_id: eventDetails.id,
          user_id: userDetails.id,
          notification_type: type,
          channel,
          status: "failed",
          metadata: { error: String(error) },
        });
      }
    }
  }

  /**
   * Generate a QR code token for event check-in
   */
  private static generateQRCodeToken(eventId: string, userId: string): string {
    // In a real app, you would use a more secure method to generate tokens
    // This is a simple implementation for demonstration purposes
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${eventId.substring(0, 8)}-${userId.substring(0, 8)}-${timestamp}-${randomPart}`;
  }

  /**
   * Get the QR code URL for a token
   */
  static getQRCodeUrl(token: string): string {
    // In a real app, you would generate a QR code image
    // For now, we'll use a public QR code generator API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(token)}`;
  }
}
