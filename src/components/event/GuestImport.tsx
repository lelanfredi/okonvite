import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Table, AlertCircle, CheckCircle2, UserPlus, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddGuestForm from "./AddGuestForm";
import { Separator } from "@/components/ui/separator";

export interface Guest {
  name: string;
  email?: string;
  phone?: string;
  guestsCount?: number;
  dietaryRestrictions?: string;
}

interface GuestImportProps {
  onImport: (guests: Guest[]) => void;
  onAdd: (guest: Guest) => Promise<boolean>;
}

export default function GuestImport({ onImport, onAdd }: GuestImportProps) {
  const { language } = useI18n();
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const [previewGuests, setPreviewGuests] = useState<Guest[]>([]);

  const validateGuest = (guest: Guest) => {
    const errors: string[] = [];

    if (!guest.name?.trim()) {
      errors.push(language === "pt" ? "Nome é obrigatório" : "Name is required");
    }

    // Pelo menos um campo de contato deve estar preenchido
    if (!guest.email?.trim() && !guest.phone?.trim()) {
      errors.push(
        language === "pt"
          ? "Preencha pelo menos um campo de contato (email ou telefone)"
          : "Fill in at least one contact field (email or phone)"
      );
    }

    // Se email estiver preenchido, validar formato
    if (guest.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      errors.push(
        language === "pt"
          ? "Formato de email inválido"
          : "Invalid email format"
      );
    }

    // Se telefone estiver preenchido, validar formato básico
    if (guest.phone?.trim() && !/^\+?[\d\s-()]+$/.test(guest.phone)) {
      errors.push(
        language === "pt"
          ? "Formato de telefone inválido"
          : "Invalid phone format"
      );
    }

    return errors;
  };

  const parseGuestsFromText = (text: string): Guest[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const guests: Guest[] = [];
    const errors: string[] = [];

    for (const line of lines) {
      const parts = line.split(',').map(part => part.trim());
      const guest: Guest = { name: parts[0] };

      // Tenta identificar email e telefone nas outras partes
      for (const part of parts.slice(1)) {
        if (part.includes('@')) {
          guest.email = part;
        } else if (/^\+?[\d\s-()]+$/.test(part)) {
          guest.phone = part;
        }
      }

      const validationErrors = validateGuest(guest);
      if (validationErrors.length === 0) {
        guests.push(guest);
      } else {
        errors.push(`${language === "pt" ? "Erro na linha" : "Error in line"} "${line}": ${validationErrors.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return [];
    }

    return guests;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const guests = parseGuestsFromText(text);
      setPreviewGuests(guests);
      setError("");
      setSuccess(
        language === "pt"
          ? `${guests.length} convidados encontrados no arquivo`
          : `${guests.length} guests found in the file`
      );
      
      // Importar automaticamente
      onImport(guests);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
      setPreviewGuests([]);
    }
  };

  // Efeito para verificar a lista automaticamente quando o texto muda
  useEffect(() => {
    if (bulkText.trim()) {
      try {
        const guests = parseGuestsFromText(bulkText);
        setPreviewGuests(guests);
        setError("");
        setSuccess(
          language === "pt"
            ? `${guests.length} convidados encontrados`
            : `${guests.length} guests found`
        );
      } catch (err: any) {
        setError(err.message);
        setSuccess("");
        setPreviewGuests([]);
      }
    } else {
      setPreviewGuests([]);
      setError("");
      setSuccess("");
    }
  }, [bulkText, language]);

  const handleImport = () => {
    if (previewGuests.length === 0) {
      setError(
        language === "pt"
          ? "Nenhum convidado para importar"
          : "No guests to import"
      );
      return;
    }

    onImport(previewGuests);
    setBulkText("");
    setPreviewGuests([]);
    setSuccess("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-3">
        <AddGuestForm onAdd={onAdd} />
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {language === "pt" ? "ou importe vários convidados" : "or import multiple guests"}
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {language === "pt" ? "Colar Lista" : "Paste List"}
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {language === "pt" ? "Enviar Arquivo" : "Upload File"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="border-2 border-dashed p-4">
              <div className="flex flex-col items-center text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                <div className="space-y-1">
                  <h3 className="font-medium text-base">
                    {language === "pt"
                      ? "Envie seu arquivo CSV ou TXT"
                      : "Upload your CSV or TXT file"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {language === "pt"
                      ? "Arraste e solte seu arquivo aqui ou clique para selecionar"
                      : "Drag and drop your file here or click to browse"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "pt"
                      ? "Formato: nome, email/telefone, telefone/email"
                      : "Format: name, email/phone, phone/email"}
                  </p>
                </div>
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="mt-3 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer"
                >
                  {language === "pt" ? "Selecionar Arquivo" : "Select File"}
                </Label>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="paste">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>
                  {language === "pt"
                    ? "Cole sua lista de convidados"
                    : "Paste your guest list"}
                </Label>
                <Textarea
                  placeholder={
                    language === "pt"
                      ? "Digite um convidado por linha: nome, email/telefone, telefone/email\n\nExemplo:\nJoão Silva, joao@email.com, +5511999999999\nMaria Santos, +5511988888888, maria@email.com"
                      : "Enter one guest per line: name, email/phone, phone/email\n\nExample:\nJohn Doe, john@email.com, +1234567890\nJane Smith, +9876543210, jane@email.com"
                  }
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {language === "pt"
                    ? "Dica: Você pode copiar e colar diretamente de uma planilha"
                    : "Tip: You can copy and paste directly from a spreadsheet"}
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-sm whitespace-pre-line">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="py-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-sm">{success}</AlertDescription>
                </Alert>
              )}

              {previewGuests.length > 0 && (
                <div className="space-y-3">
                  <div className="rounded-lg border max-h-[200px] overflow-auto">
                    <Table>
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                            {language === "pt" ? "Nome" : "Name"}
                          </th>
                          <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                            {language === "pt" ? "Email" : "Email"}
                          </th>
                          <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                            {language === "pt" ? "Telefone" : "Phone"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewGuests.map((guest, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2 text-sm">{guest.name}</td>
                            <td className="p-2 text-sm">{guest.email || "-"}</td>
                            <td className="p-2 text-sm">{guest.phone || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleImport} size="sm">
                      {language === "pt"
                        ? `Importar ${previewGuests.length} Convidados`
                        : `Import ${previewGuests.length} Guests`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
