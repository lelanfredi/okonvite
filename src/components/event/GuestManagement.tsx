import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import GuestImport, { Guest } from "./GuestImport";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Share2,
  MessageSquare,
  Copy,
  Check,
  X,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddGuestDialog from "./AddGuestDialog";
import GuestList from "./GuestList";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/use-toast";

interface GuestManagementProps {
  eventId?: string;
  onInvite?: (method: string, guests: Guest[], message?: string) => void;
  onRsvpUpdate?: (guestId: string, status: "accepted" | "declined") => void;
}

const GuestManagement = ({
  eventId,
  onInvite = () => {},
  onRsvpUpdate = () => {},
}: GuestManagementProps) => {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("add");
  const [shortId, setShortId] = useState<string>("");
  const [inviteLink, setInviteLink] = React.useState(
    `${window.location.origin}/e/${eventId}`,
  );
  const [copied, setCopied] = React.useState(false);
  const [showAddGuest, setShowAddGuest] = React.useState(false);
  const [messageText, setMessageText] = useState(
    language === "pt"
      ? "Você está convidado! Junte-se a nós para um evento especial. Ficaríamos encantados em tê-lo lá."
      : "You're invited! Join us for a special event. We would be delighted to have you there.",
  );
  const [messageStyle, setMessageStyle] = useState("formal");

  useEffect(() => {
    if (!eventId) return;

    // Buscar o short_id do evento
    const fetchShortId = async () => {
      const { data: event, error } = await supabase
        .from("events")
        .select("short_id")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error fetching short_id:", error);
        return;
      }

      if (event?.short_id) {
        setShortId(event.short_id);
        setInviteLink(`${window.location.origin}/e/${event.short_id}`);
      }
    };

    fetchShortId();
  }, [eventId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{t("guests.management")}</h2>
      {/* Removed warning message about saving the event first */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="add">{t("guests.add")}</TabsTrigger>
          <TabsTrigger value="invite">{t("guests.send_invites")}</TabsTrigger>
          <TabsTrigger value="manage">{t("guests.manage")}</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t("guests.add")}</h3>
                <Button onClick={() => setShowAddGuest(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {language === "pt" ? "Adicionar Convidado" : "Add Guest"}
                </Button>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-medium mb-4">
                  {t("guests.import")}
                </h4>
                <GuestImport
                  onImport={async (importedGuests) => {
                    if (!eventId) {
                      toast({
                        title: language === "pt" ? "Informação" : "Information",
                        description:
                          language === "pt"
                            ? "Os convidados serão vinculados ao evento quando ele for salvo"
                            : "Guests will be linked to the event when it is saved",
                      });
                      return;
                    }

                    try {
                      // Obter o ID do usuário atual (organizador)
                      const { data: { user }, error: authError } = await supabase.auth.getUser();
                      
                      if (authError) throw authError;
                      if (!user) throw new Error("Usuário não autenticado");

                      const { error } = await supabase
                        .from("event_rsvps")
                        .insert(
                          importedGuests.map((guest) => ({
                            event_id: eventId,
                            name: guest.name,
                            email: guest.email || null,
                            phone: guest.phone || null,
                            status: "pending",
                            guests_count: 0,
                            dietary_restrictions: "",
                            user_id: user.id, // Adiciona o ID do organizador
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          })),
                        );

                      if (error) throw error;

                      setActiveTab("manage");

                      toast({
                        title: language === "pt" ? "Sucesso" : "Success",
                        description:
                          language === "pt"
                            ? `${importedGuests.length} convidados adicionados com sucesso`
                            : `${importedGuests.length} guests added successfully`,
                      });
                    } catch (error) {
                      console.error("Error importing guests:", error);
                      toast({
                        title: language === "pt" ? "Erro" : "Error",
                        description:
                          language === "pt"
                            ? "Erro ao importar convidados"
                            : "Error importing guests",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="invite">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t("guests.invite_methods")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => onInvite("email", [])}
                    className="flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t("guests.email_invites")}
                  </Button>
                  <Button
                    onClick={() => onInvite("whatsapp", [])}
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t("guests.whatsapp_invites")}
                  </Button>
                  <Button
                    onClick={() => onInvite("share", [])}
                    className="flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    {t("guests.share_link")}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {t("guests.invitation_message")}
                </h3>
                <Select value={messageStyle} onValueChange={setMessageStyle}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        language === "pt"
                          ? "Selecione o estilo da mensagem"
                          : "Select message style"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">
                      {language === "pt" ? "Formal" : "Formal"}
                    </SelectItem>
                    <SelectItem value="casual">
                      {language === "pt" ? "Casual" : "Casual"}
                    </SelectItem>
                    <SelectItem value="fun">
                      {language === "pt" ? "Divertido" : "Fun & Playful"}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>{t("guests.message_template")}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t("guests.get_suggestions")}
                    </Button>
                  </div>
                  <Textarea
                    placeholder={
                      language === "pt"
                        ? "Escreva sua mensagem de convite..."
                        : "Write your invitation message..."
                    }
                    className="min-h-[100px]"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>

                <RadioGroup
                  value="template1"
                  className="space-y-2"
                  onValueChange={(value) => {
                    if (value === "template1") {
                      setMessageText(
                        language === "pt"
                          ? "Temos o prazer de convidá-lo a se juntar a nós para um evento especial. Sua presença seria uma honra."
                          : "We cordially invite you to join us for a special event. Your presence would be an honor.",
                      );
                      setMessageStyle("formal");
                    } else if (value === "template2") {
                      setMessageText(
                        language === "pt"
                          ? "Ei! Estamos fazendo uma festa e gostaríamos que você viesse. Vai ser divertido!"
                          : "Hey! We're having a party and would love for you to come. It's going to be fun!",
                      );
                      setMessageStyle("casual");
                    } else if (value === "template3") {
                      setMessageText(
                        language === "pt"
                          ? "Prepare-se para uma celebração incrível! Traga sua energia positiva e vamos fazer história!"
                          : "Get ready for an amazing celebration! Bring your positive energy and let's make history!",
                      );
                      setMessageStyle("fun");
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template1" id="template1" />
                    <Label htmlFor="template1">
                      {language === "pt"
                        ? 'Formal: "Temos o prazer de convidá-lo a se juntar a nós..."'
                        : 'Formal: "We cordially invite you to join us..."'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template2" id="template2" />
                    <Label htmlFor="template2">
                      {language === "pt"
                        ? 'Casual: "Ei! Estamos fazendo uma festa..."'
                        : 'Casual: "Hey! We\'re having a party..."'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template3" id="template3" />
                    <Label htmlFor="template3">
                      {language === "pt"
                        ? 'Divertido: "Prepare-se para uma celebração incrível..."'
                        : 'Fun: "Get ready for an amazing celebration..."'}
                    </Label>
                  </div>
                </RadioGroup>

                <div className="pt-4">
                  <h3 className="text-lg font-semibold">
                    {t("guests.shareable_link")}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <Input value={inviteLink} readOnly className="flex-1" />
                    <Button onClick={copyToClipboard}>
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t("guests.automated_reminders")}
                  </h3>
                  <Switch />
                </div>
                <p className="text-sm text-gray-500">
                  {t("guests.reminders_description")}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card className="p-6">
            <GuestList
              eventId={eventId || ""}
              onSendMessage={(guests) => {
                // Handle sending message to selected guests
                onInvite("email", guests, messageText);
              }}
            />

            <div className="mt-6">
              <Label htmlFor="dietary">{t("guests.dietary_note")}</Label>
              <Textarea
                id="dietary"
                placeholder={t("guests.dietary_placeholder")}
                className="mt-2"
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AddGuestDialog
        open={showAddGuest}
        onOpenChange={setShowAddGuest}
        onAdd={async (guest) => {
          if (!eventId) {
            toast({
              title: language === "pt" ? "Informação" : "Information",
              description:
                language === "pt"
                  ? "Os convidados serão vinculados ao evento quando ele for salvo"
                  : "Guests will be linked to the event when it is saved",
            });
            return;
          }

          try {
            // Obter o ID do usuário atual (organizador)
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) throw authError;
            if (!user) throw new Error("Usuário não autenticado");

            const { error } = await supabase.from("event_rsvps").insert([
              {
                event_id: eventId,
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                status: "pending",
                guests_count: 0,
                dietary_restrictions: "",
                user_id: user.id, // Adiciona o ID do organizador
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

            if (error) throw error;

            setActiveTab("manage");

            toast({
              title: language === "pt" ? "Sucesso" : "Success",
              description:
                language === "pt"
                  ? "Convidado adicionado com sucesso"
                  : "Guest added successfully",
            });
          } catch (error) {
            console.error("Error adding guest:", error);
            toast({
              title: language === "pt" ? "Erro" : "Error",
              description:
                language === "pt"
                  ? "Erro ao adicionar convidado"
                  : "Error adding guest",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
};

export default GuestManagement;
