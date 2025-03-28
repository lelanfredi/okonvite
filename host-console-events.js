let isCreatingEvent = false; // Variável para controlar o estado de criação

async function createEvent(eventData) {
    try {
        const response = await api.createEvent(eventData);
        console.log("Resposta da API:", response); // Log da resposta da API

        // Verifique se a resposta contém a propriedade 'success' e 'eventId'
        if (response && response.success && response.eventId) {
            console.log("Evento criado com sucesso, redirecionando para o evento ID:", response.eventId);
            redirectToEventPage(response.eventId); // Redireciona para a página do evento
        } else {
            console.error("Erro ao criar evento:", response.error || "Resposta inválida");
            showErrorMessage("Não foi possível criar o evento.");
        }
    } catch (error) {
        console.error("Erro inesperado:", error);
        showErrorMessage("Ocorreu um erro ao criar o evento.");
    }
}

async function handleCreateEvent(eventData) {
    if (isCreatingEvent) return; // Evitar múltiplas criações
    isCreatingEvent = true; // Desabilitar o botão

    try {
        await createEvent(eventData);
    } finally {
        isCreatingEvent = false; // Reabilitar após a tentativa
    }
}

// Exemplo de implementação da função de redirecionamento
function redirectToEventPage(eventId) {
    // Verifique se o eventId é válido antes de redirecionar
    if (eventId) {
        console.log("Redirecionando para:", `/events/${eventId}`); // Log do redirecionamento
        window.location.href = `/events/${eventId}`; // Redireciona para a página do evento
    } else {
        console.error("ID do evento inválido para redirecionamento.");
        showErrorMessage("ID do evento inválido.");
    }
} 