import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Calendar as CalendarIcon,
  Upload,
  UserPlus,
  X,
  Search,
} from "lucide-react";
import { searchLocation } from "@/lib/google-maps";
import { useI18n } from "@/lib/i18n";

interface CoOrganizer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface CustomizationPanelProps {
  selectedDate?: Date;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  rsvpDeadline?: Date;
  categories?: string[];
  tags?: string[];
  onDateChange?: (date: Date) => void;
  location?: string;
  onLocationChange?: (location: string) => void;
  bannerImage?: string;
  onBannerUpload?: (file: File) => void;
  coOrganizers?: CoOrganizer[];
  onAddCoOrganizer?: (organizer: CoOrganizer) => void;
  onRemoveCoOrganizer?: (organizerId: string) => void;
}

const CustomizationPanel = ({
  selectedDate = new Date(),
  startTime = format(
    new Date(
      Math.ceil(new Date().getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000),
    ),
    "HH:mm",
  ),
  endTime = "23:00",
  maxCapacity = 100,
  rsvpDeadline = new Date(),
  categories = [],
  tags = [],
  onDateChange = () => {},
  location = "",
  onLocationChange = () => {},
  bannerImage = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  onBannerUpload = () => {},
  coOrganizers = [],
  onAddCoOrganizer = () => {},
  onRemoveCoOrganizer = () => {},
}: CustomizationPanelProps) => {
  const { language } = useI18n();

  const handleLocationSearch = async () => {
    if (!location) return;

    try {
      const results = await searchLocation(location);
      if (results.length > 0) {
        onLocationChange(results[0].formatted_address || "");
      }
    } catch (error) {
      console.error("Failed to search location:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date/Time Selection */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold">
                {language === "pt" ? "Data e Horário" : "Date & Time"}
              </h3>
            </div>
            <div className="flex gap-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    const [hours, minutes] = startTime.split(":").map(Number);
                    const newDate = new Date(date);
                    newDate.setHours(hours, minutes);
                    onDateChange(newDate);
                  }
                }}
                className="rounded-md border"
                locale={language === "pt" ? ptBR : undefined}
                formatters={{
                  formatCaption: (date, options) => {
                    if (language === "pt") {
                      return format(date, "LLLL yyyy", { locale: ptBR });
                    }
                    return format(date, "LLLL yyyy", options);
                  },
                }}
              />
              <div className="space-y-6 flex-1">
                <div className="space-y-4">
                  <Label className="text-purple-700 font-medium">
                    {language === "pt" ? "Horário do Evento" : "Event Time"}
                  </Label>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label className="text-purple-700 font-medium">
                        {language === "pt" ? "Horário de Início" : "Start Time"}
                      </Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value
                            .split(":")
                            .map(Number);
                          const newDate = new Date(selectedDate);
                          newDate.setHours(hours, minutes);
                          onDateChange(newDate);
                        }}
                        className="border-gray-300 text-black font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-700 font-medium">
                        {language === "pt" ? "Horário de Término" : "End Time"}
                      </Label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => console.log(e.target.value)}
                        className="border-gray-300 text-black font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Location Input and Maximum Capacity */}
        <Card className="p-4">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-purple-700">
                  {language === "pt" ? "Localização" : "Location"}
                </h3>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={
                    language === "pt"
                      ? "Buscar por uma localização"
                      : "Search for a location"
                  }
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="border-gray-300 text-black font-medium"
                />
                <Button
                  variant="outline"
                  className="flex gap-2 text-purple-700 border-purple-700"
                  onClick={handleLocationSearch}
                >
                  <Search className="h-4 w-4" />
                  {language === "pt" ? "Buscar" : "Search"}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-purple-700 font-medium">
                  {language === "pt" ? "Capacidade Máxima" : "Maximum Capacity"}
                </Label>
                <Input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => console.log(e.target.value)}
                  min={1}
                  className="border-gray-300 text-black font-medium"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Banner Image Upload */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-purple-700">
              {language === "pt" ? "Imagem de Banner" : "Banner Image"}
            </h3>
          </div>
          <div className="relative">
            <img
              src={bannerImage}
              alt="Event banner"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              variant="secondary"
              className="absolute bottom-4 right-4"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) onBannerUpload(file);
                };
                input.click();
              }}
            >
              {language === "pt" ? "Alterar Banner" : "Change Banner"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Co-organizer Management */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-purple-700">
                {language === "pt" ? "Co-organizadores" : "Co-organizers"}
              </h3>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-purple-700 border-purple-700"
                  disabled={coOrganizers.length >= 5}
                >
                  {language === "pt"
                    ? "Adicionar Co-organizador"
                    : "Add Co-organizer"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === "pt"
                      ? "Adicionar Co-organizador"
                      : "Add Co-organizer"}
                  </DialogTitle>
                  <DialogDescription>
                    {language === "pt"
                      ? "Insira os detalhes do co-organizador"
                      : "Enter the details of the co-organizer"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-purple-700">
                      {language === "pt" ? "Nome" : "Name"}
                    </Label>
                    <Input
                      id="name"
                      placeholder={
                        language === "pt" ? "Digite o nome" : "Enter name"
                      }
                      className="border-gray-300 text-black font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-purple-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={
                        language === "pt" ? "Digite o email" : "Enter email"
                      }
                      className="border-gray-300 text-black font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-purple-700">
                      {language === "pt" ? "Telefone" : "Phone"}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={
                        language === "pt"
                          ? "Digite o número de telefone"
                          : "Enter phone number"
                      }
                      className="border-gray-300 text-black font-medium"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    className="bg-purple-700 hover:bg-purple-800"
                    onClick={() => {
                      const newOrganizer = {
                        id: Math.random().toString(),
                        name: (
                          document.getElementById("name") as HTMLInputElement
                        ).value,
                        email: (
                          document.getElementById("email") as HTMLInputElement
                        ).value,
                        phone: (
                          document.getElementById("phone") as HTMLInputElement
                        ).value,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
                      };
                      onAddCoOrganizer(newOrganizer);
                    }}
                  >
                    {language === "pt"
                      ? "Adicionar Co-organizador"
                      : "Add Co-organizer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap gap-4">
            {coOrganizers.map((organizer) => (
              <div
                key={organizer.id}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2"
              >
                <div>
                  <span className="font-medium">{organizer.name}</span>
                  <div className="text-sm text-gray-500">
                    {organizer.email && <div>{organizer.email}</div>}
                    {organizer.phone && <div>{organizer.phone}</div>}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveCoOrganizer(organizer.id)}
                  className="text-gray-500 hover:text-gray-700 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomizationPanel;
