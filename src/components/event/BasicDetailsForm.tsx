import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  title: z
    .string()
    .min(2, "O título deve ter pelo menos 2 caracteres")
    .nonempty("Preencha esse campo"),
  description: z.string().nonempty("Preencha esse campo"),
  isPrivate: z.boolean().default(false),
});

type BasicDetailsFormProps = {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: z.infer<typeof formSchema>;
};

const BasicDetailsForm = ({
  onSubmit = (values) => console.log("Form submitted:", values),
  defaultValues = {
    title: "",
    description: "",
    isPrivate: false,
  },
}: BasicDetailsFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Card className="w-full p-6 bg-white shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Evento *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o título do evento"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onSubmit({ ...defaultValues, title: e.target.value });
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Escolha um título claro e descritivo para o seu evento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição do Evento *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva seu evento..."
                    className="min-h-[100px]"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onSubmit({
                        ...form.getValues(),
                        description: e.target.value,
                      });
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Forneça detalhes sobre seu evento para ajudar os convidados a
                  entenderem o que esperar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Evento Privado</FormLabel>
                  <FormDescription>
                    Torne seu evento privado para controlar quem pode ver e
                    participar
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Card>
  );
};

export default BasicDetailsForm;
