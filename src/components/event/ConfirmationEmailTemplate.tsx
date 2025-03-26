import React from "react";

interface ConfirmationEmailTemplateProps {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  qrCodeUrl?: string;
  eventUrl: string;
  recipientName: string;
}

export const ConfirmationEmailTemplate: React.FC<
  ConfirmationEmailTemplateProps
> = ({
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  qrCodeUrl,
  eventUrl,
  recipientName,
}) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#6d28d9",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Presença Confirmada!</h1>
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
        }}
      >
        <p style={{ fontSize: "16px" }}>
          Olá, <strong>{recipientName}</strong>!
        </p>

        <p style={{ fontSize: "16px" }}>
          Sua presença foi confirmada para o evento <strong>{eventName}</strong>
          . Estamos ansiosos para vê-lo lá!
        </p>

        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            margin: "20px 0",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ color: "#6d28d9", marginTop: 0 }}>Detalhes do Evento</h2>

          <p style={{ margin: "8px 0" }}>
            <strong>Data:</strong> {eventDate}
          </p>

          <p style={{ margin: "8px 0" }}>
            <strong>Horário:</strong> {eventTime}
          </p>

          <p style={{ margin: "8px 0" }}>
            <strong>Local:</strong> {eventLocation}
          </p>
        </div>

        {qrCodeUrl && (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <p
              style={{
                fontSize: "14px",
                color: "#4b5563",
                marginBottom: "10px",
              }}
            >
              Apresente este QR Code na entrada do evento:
            </p>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              style={{ width: "150px", height: "150px" }}
            />
          </div>
        )}

        <div style={{ textAlign: "center", margin: "25px 0" }}>
          <a
            href={eventUrl}
            style={{
              backgroundColor: "#6d28d9",
              color: "white",
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            Ver Página do Evento
          </a>
        </div>

        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "30px" }}>
          Você receberá lembretes automáticos antes do evento. Para ajustar suas
          preferências de notificação, visite a página do evento.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#f3f4f6",
          padding: "15px",
          textAlign: "center",
          fontSize: "12px",
          color: "#6b7280",
        }}
      >
        <p>Este é um email automático. Por favor, não responda a este email.</p>
        <p>© 2024 Konvite. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default ConfirmationEmailTemplate;
