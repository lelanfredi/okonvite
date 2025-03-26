import React from "react";

interface ReminderEmailTemplateProps {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  daysRemaining: number;
  eventUrl: string;
  recipientName: string;
  isUpdate?: boolean;
  updateMessage?: string;
}

export const ReminderEmailTemplate: React.FC<ReminderEmailTemplateProps> = ({
  eventName,
  eventDate,
  eventTime,
  eventLocation,
  daysRemaining,
  eventUrl,
  recipientName,
  isUpdate = false,
  updateMessage,
}) => {
  const getTitle = () => {
    if (isUpdate) return "Atualização Importante do Evento";
    if (daysRemaining === 1) return "Seu evento é amanhã!";
    if (daysRemaining === 7) return "Seu evento é em uma semana!";
    return `Lembrete: ${daysRemaining} dias para o evento`;
  };

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
          backgroundColor: isUpdate ? "#f59e0b" : "#6d28d9",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>{getTitle()}</h1>
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

        {isUpdate ? (
          <p style={{ fontSize: "16px" }}>
            Houve uma atualização importante no evento{" "}
            <strong>{eventName}</strong> que você confirmou presença.
          </p>
        ) : (
          <p style={{ fontSize: "16px" }}>
            Este é um lembrete para o evento <strong>{eventName}</strong> que
            acontecerá em{" "}
            <strong>
              {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
            </strong>
            .
          </p>
        )}

        {isUpdate && updateMessage && (
          <div
            style={{
              backgroundColor: "#fff7ed",
              borderLeft: "4px solid #f59e0b",
              padding: "15px",
              margin: "15px 0",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>Atualização:</p>
            <p style={{ margin: "8px 0 0 0" }}>{updateMessage}</p>
          </div>
        )}

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

        <div style={{ textAlign: "center", margin: "25px 0" }}>
          <a
            href={eventUrl}
            style={{
              backgroundColor: isUpdate ? "#f59e0b" : "#6d28d9",
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
          Para ajustar suas preferências de notificação, visite a página do
          evento.
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

export default ReminderEmailTemplate;
