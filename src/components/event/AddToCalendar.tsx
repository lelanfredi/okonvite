import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, CalendarPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";

interface AddToCalendarProps {
  eventName: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  description?: string;
}

export default function AddToCalendar({
  eventName,
  startDate,
  endDate,
  location,
  description,
}: AddToCalendarProps) {
  const { language } = useI18n();

  // Função para formatar data no formato requerido pelo Google Calendar
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  // Função para gerar link do Google Calendar
  const getGoogleCalendarUrl = () => {
    const endDateTime = endDate || new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 horas
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventName,
      dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDateTime)}`,
      ...(location && { location }),
      ...(description && { details: description }),
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Função para gerar arquivo ICS (Apple Calendar)
  const generateIcsFile = () => {
    const endDateTime = endDate || new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 horas
    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, -1);
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDateTime)}`,
      `SUMMARY:${eventName}`,
      ...(location ? [`LOCATION:${location}`] : []),
      ...(description ? [`DESCRIPTION:${description}`] : []),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <CalendarPlus className="w-4 h-4" />
          {language === "pt" ? "Adicionar ao Calendário" : "Add to Calendar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(getGoogleCalendarUrl(), '_blank')}>
          <Calendar className="w-4 h-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateIcsFile}>
          <Calendar className="w-4 h-4 mr-2" />
          {language === "pt" ? "Apple Calendário" : "Apple Calendar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 