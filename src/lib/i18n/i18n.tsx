import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "pt" | "en";

export type Translations = {
  [key: string]: {
    pt: string;
    en: string;
  };
};

export const translations: Translations = {
  // User Menu
  logout: {
    pt: "Sair",
    en: "Logout",
  },
  profile: {
    pt: "Perfil",
    en: "Profile",
  },
  settings: {
    pt: "Configurações",
    en: "Settings",
  },
  // Header
  "header.resources": {
    pt: "Recursos",
    en: "Resources",
  },
  "header.login": {
    pt: "Entrar",
    en: "Login",
  },
  // Hero
  "hero.title": {
    pt: "Sua festa começa aqui",
    en: "Your party starts here",
  },
  "hero.subtitle": {
    pt: "Planeje, organize e gerencie seus eventos em um só lugar. De aniversários a eventos corporativos, a gente simplifica tudo pra você.",
    en: "Plan, organize and manage your events in one place. From birthdays to corporate events, we simplify everything for you.",
  },
  "hero.button": {
    pt: "Criar meu evento",
    en: "Create my event",
  },
  // Resources
  "resources.title": {
    pt: "Tudo que você precisa para seu evento",
    en: "Everything you need for your event",
  },
  "resources.subtitle": {
    pt: "O Konvite simplifica todo o processo de organização, desde o planejamento até o grande dia.",
    en: "Konvite simplifies the entire organization process, from planning to the big day.",
  },
  "resources.feature1.title": {
    pt: "Crie eventos em minutos",
    en: "Create events in minutes",
  },
  "resources.feature1.description": {
    pt: "Organize aniversários, festas temáticas ou eventos corporativos com nosso assistente intuitivo.",
    en: "Organize birthdays, themed parties or corporate events with our intuitive assistant.",
  },
  "resources.feature2.title": {
    pt: "Gerencie convidados",
    en: "Manage guests",
  },
  "resources.feature2.description": {
    pt: "Envie convites, acompanhe confirmações e organize informações dos seus convidados em um só lugar.",
    en: "Send invitations, track confirmations and organize your guests information in one place.",
  },
  "resources.feature3.title": {
    pt: "Lembretes automáticos",
    en: "Automatic reminders",
  },
  "resources.feature3.description": {
    pt: "Envie lembretes personalizados para seus convidados e garanta maior presença no seu evento.",
    en: "Send personalized reminders to your guests and ensure greater attendance at your event.",
  },
  "resources.feature4.title": {
    pt: "Compartilhe facilmente",
    en: "Share easily",
  },
  "resources.feature4.description": {
    pt: "Compartilhe seu evento nas redes sociais ou envie o link diretamente para seus convidados.",
    en: "Share your event on social media or send the link directly to your guests.",
  },
  // Event Creation Wizard
  "wizard.step1": {
    pt: "Tipo do Evento",
    en: "Event Type",
  },
  "wizard.step2": {
    pt: "Detalhes do Evento",
    en: "Event Details",
  },
  "wizard.step3": {
    pt: "Convidados",
    en: "Guests",
  },
  "wizard.step4": {
    pt: "Compartilhar konvites",
    en: "Share invitations",
  },
  "wizard.back": {
    pt: "Voltar",
    en: "Back",
  },
  "wizard.next": {
    pt: "Próximo",
    en: "Next",
  },
  "wizard.finish": {
    pt: "Concluir",
    en: "Finish",
  },
  // Language selector
  language: {
    pt: "Idioma",
    en: "Language",
  },
  "language.portuguese": {
    pt: "Português",
    en: "Portuguese",
  },
  "language.english": {
    pt: "Inglês",
    en: "English",
  },
  // Guest Management
  "guests.management": {
    pt: "Gerenciamento de Convidados",
    en: "Guest Management",
  },
  "guests.add": {
    pt: "Adicionar Convidados",
    en: "Add Guests",
  },
  "guests.send_invites": {
    pt: "Enviar Convites",
    en: "Send Invites",
  },
  "guests.manage": {
    pt: "Gerenciar Convidados",
    en: "Manage Guests",
  },
  "guests.import": {
    pt: "Importar Múltiplos Convidados",
    en: "Import Multiple Guests",
  },
  "guests.invite_methods": {
    pt: "Métodos de Convite",
    en: "Invite Methods",
  },
  "guests.email_invites": {
    pt: "Convites por Email",
    en: "Email Invites",
  },
  "guests.whatsapp_invites": {
    pt: "Convites por WhatsApp",
    en: "WhatsApp Invites",
  },
  "guests.share_link": {
    pt: "Compartilhar Link",
    en: "Share Link",
  },
  "guests.invitation_message": {
    pt: "Mensagem de Convite",
    en: "Invitation Message",
  },
  "guests.message_template": {
    pt: "Modelo de Mensagem",
    en: "Message Template",
  },
  "guests.get_suggestions": {
    pt: "Obter Sugestões",
    en: "Get Suggestions",
  },
  "guests.shareable_link": {
    pt: "Link Compartilhável",
    en: "Shareable Link",
  },
  "guests.automated_reminders": {
    pt: "Lembretes Automáticos",
    en: "Automated Reminders",
  },
  "guests.reminders_description": {
    pt: "Enviar lembretes automáticos para convidados que não responderam",
    en: "Send automatic reminders to guests who haven't responded",
  },
  "guests.dietary_note": {
    pt: "Nota sobre Restrições Alimentares",
    en: "Dietary Restrictions Note",
  },
  "guests.dietary_placeholder": {
    pt: "Adicione notas gerais sobre acomodações alimentares...",
    en: "Add any general notes about dietary accommodations...",
  },
};

type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

export const I18nContext = createContext<I18nContextType>({
  language: "pt",
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);

type I18nProviderProps = {
  children: ReactNode;
};

export const I18nProvider = ({ children }: I18nProviderProps) => {
  // Check localStorage for saved language preference
  const savedLanguage =
    typeof window !== "undefined"
      ? (localStorage.getItem("language") as Language)
      : null;
  const [language, setLanguage] = useState<Language>(savedLanguage || "pt");

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
