import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Search, Upload } from "lucide-react";
import {
  ValidatedForm,
  FormField,
} from "@/components/ui/form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TimePicker } from "@/components/ui/time-picker";

interface BasicDetailsFormProps {
  onSubmit: (values: {
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime?: string;
    location: string;
    maxCapacity: number;
    bannerImage?: string;
    saveTheDate?: {
      deadline: string;
      message: string;
    };
  }) => void;
  defaultValues?: {
    title?: string;
    description?: string;
    date?: Date;
    startTime?: string;
    endTime?: string;
    location?: string;
    maxCapacity?: number;
    bannerImage?: string;
    saveTheDate?: {
      deadline?: string;
      message?: string;
    };
  };
}

export function BasicDetailsForm({ onSubmit, defaultValues = {} }: BasicDetailsFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: defaultValues.title || "",
    description: defaultValues.description || "",
    date: defaultValues.date || new Date(),
    startTime: defaultValues.startTime || format(new Date().setMinutes(0, 0, 0), "HH:mm"),
    endTime: defaultValues.endTime || "",
    location: defaultValues.location || "",
    maxCapacity: defaultValues.maxCapacity || 100,
    bannerImage: defaultValues.bannerImage || "",
    saveTheDate: {
      deadline: defaultValues.saveTheDate?.deadline || "",
      message: defaultValues.saveTheDate?.message || "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: any) => {
    const newErrors: Record<string, string> = {};

    switch (name) {
      case "title":
        if (!value) {
          newErrors.title = "O título é obrigatório";
        }
        break;
      case "description":
        break;
      case "date":
        if (!value) {
          newErrors.date = "A data é obrigatória";
        } else if (value < new Date().setHours(0, 0, 0, 0)) {
          newErrors.date = "A data não pode ser no passado";
        }
        break;
      case "startTime":
        if (!value) {
          newErrors.startTime = "O horário de início é obrigatório";
        }
        break;
      case "location":
        break;
      case "maxCapacity":
        if (!value || value < 1) {
          newErrors.maxCapacity = "A capacidade máxima deve ser maior que 0";
        }
        break;
      case "saveTheDate.deadline":
        if (value) {
          const deadlineDate = new Date(value);
          const eventDate = new Date(formData.date);
          if (deadlineDate >= eventDate) {
            newErrors["saveTheDate.deadline"] = "A data limite deve ser anterior à data do evento";
          }
        }
        break;
      case "saveTheDate.message":
        if (formData.saveTheDate.deadline && !value) {
          newErrors["saveTheDate.message"] = "Por favor, adicione uma mensagem para seus convidados";
        }
        break;
    }

    return newErrors;
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, ...validateField(name, value) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, ...validateField(name, formData[name]) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let newErrors: Record<string, string> = {};
    let missingFields: string[] = [];

    Object.keys(formData).forEach((key) => {
      if (key !== "endTime" && key !== "bannerImage" && key !== "saveTheDate") {
        const fieldErrors = validateField(key, formData[key as keyof typeof formData]);
        if (Object.keys(fieldErrors).length > 0) {
          newErrors = { ...newErrors, ...fieldErrors };
          missingFields.push(key);
        }
      }
    });

    // Validar campos do save the date
    if (formData.saveTheDate.deadline) {
      const deadlineErrors = validateField("saveTheDate.deadline", formData.saveTheDate.deadline);
      const messageErrors = validateField("saveTheDate.message", formData.saveTheDate.message);
      
      if (Object.keys(deadlineErrors).length > 0) {
        newErrors = { ...newErrors, ...deadlineErrors };
        missingFields.push("data limite para confirmação");
      }
      
      if (Object.keys(messageErrors).length > 0) {
        newErrors = { ...newErrors, ...messageErrors };
        missingFields.push("mensagem para os convidados");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      
      const fieldNames = {
        title: "título",
        description: "descrição",
        date: "data",
        startTime: "horário de início",
        location: "local",
        maxCapacity: "capacidade máxima",
        "saveTheDate.deadline": "data limite para confirmação",
        "saveTheDate.message": "mensagem para os convidados"
      };
      
      toast({
        title: "Campos obrigatórios",
        description: `Por favor, preencha os seguintes campos: ${missingFields.map(f => fieldNames[f as keyof typeof fieldNames]).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Formatar os dados antes de enviar
    const formattedData = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime || undefined,
      location: formData.location,
      maxCapacity: formData.maxCapacity,
      bannerImage: formData.bannerImage || undefined,
      saveTheDate: formData.saveTheDate.deadline ? {
        deadline: formData.saveTheDate.deadline,
        message: formData.saveTheDate.message,
      } : undefined,
    };

    console.log("Submitting form data:", formattedData);
    onSubmit(formattedData);
  };

  return (
    <ValidatedForm 
      id="basic-details-form"
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      <FormField
        label="Título do Evento"
        error={touched.title && errors.title}
        required
      >
        <Input
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={() => handleBlur("title")}
          placeholder="Digite o título do evento"
        />
      </FormField>

      <FormField
        label="Descrição"
        error={touched.description && errors.description}
      >
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={() => handleBlur("description")}
          placeholder="Descreva seu evento"
          rows={4}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FormField
            label="Data"
            error={touched.date && errors.date}
            required
          >
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => handleChange("date", date)}
              onBlur={() => handleBlur("date")}
              locale={ptBR}
              disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Horário de Início"
              error={touched.startTime && errors.startTime}
              required
            >
              <TimePicker
                value={formData.startTime}
                onChange={(time) => handleChange("startTime", time)}
                onBlur={() => handleBlur("startTime")}
              />
            </FormField>

            <FormField
              label="Horário de Término"
              error={touched.endTime && errors.endTime}
            >
              <TimePicker
                value={formData.endTime}
                onChange={(time) => handleChange("endTime", time)}
                onBlur={() => handleBlur("endTime")}
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-6">
          <FormField
            label="Local"
            error={touched.location && errors.location}
          >
            <Input
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              onBlur={() => handleBlur("location")}
              placeholder="Digite o local do evento"
            />
          </FormField>

          <FormField
            label="Capacidade Máxima"
            error={touched.maxCapacity && errors.maxCapacity}
            required
          >
                  <Input
              type="number"
              min={1}
              value={formData.maxCapacity}
              onChange={(e) => handleChange("maxCapacity", parseInt(e.target.value))}
              onBlur={() => handleBlur("maxCapacity")}
              placeholder="Digite a capacidade máxima do evento"
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-purple-600">Imagem de Banner</h3>
          </div>
          
          {formData.bannerImage ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={formData.bannerImage}
                alt="Banner do evento"
                className="w-full h-48 object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                className="absolute bottom-4 right-4"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      // Aqui você implementaria o upload real da imagem
                      // Por enquanto, vamos criar uma URL temporária
                      const imageUrl = URL.createObjectURL(file);
                      handleChange("bannerImage", imageUrl);
                    }
                  };
                  input.click();
                }}
              >
                Alterar Banner
              </Button>
            </div>
          ) : (
            <div 
              className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    // Aqui você implementaria o upload real da imagem
                    // Por enquanto, vamos criar uma URL temporária
                    const imageUrl = URL.createObjectURL(file);
                    handleChange("bannerImage", imageUrl);
                  }
                };
                input.click();
              }}
            >
              <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Clique para fazer upload do banner do evento
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-purple-600">Save the Date</h3>

          <FormField
            label="Data limite para confirmação"
            error={touched.saveTheDate?.deadline && errors.saveTheDate?.deadline}
          >
            <Input
              type="date"
              value={formData.saveTheDate.deadline ? format(new Date(formData.saveTheDate.deadline), "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                handleChange("saveTheDate", {
                  ...formData.saveTheDate,
                  deadline: date ? date.toISOString() : "",
                      });
                    }}
              onBlur={() => handleBlur("saveTheDate.deadline")}
              placeholder="dd/mm/yyyy"
            />
          </FormField>

          <FormField
            label="Mensagem para compartilhar"
            error={touched.saveTheDate?.message && errors.saveTheDate?.message}
          >
            <Textarea
              value={formData.saveTheDate.message}
              onChange={(e) =>
                handleChange("saveTheDate", {
                  ...formData.saveTheDate,
                  message: e.target.value,
                })
              }
              onBlur={() => handleBlur("saveTheDate.message")}
              placeholder="Digite uma mensagem para seus convidados"
              rows={3}
            />
          </FormField>
        </div>
                </div>
    </ValidatedForm>
  );
}
