import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface SaveTheDateProps {
  onSave: (data: { deadline: string; message: string }) => void;
  defaultValues?: {
    deadline: string;
    message: string;
  };
}

export default function SaveTheDateSection({
  onSave,
  defaultValues = {
    deadline: "",
    message:
      "Marque na sua agenda! Estou organizando um evento especial e gostaria muito de contar com a sua presença.",
  },
}: SaveTheDateProps) {
  return (
    <Card className="p-6 space-y-6 bg-white">
      <div>
        <h3 className="text-lg font-semibold mb-4">Save the Date</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data limite para confirmação</Label>
            <Input
              type="date"
              value={defaultValues.deadline}
              onChange={(e) =>
                onSave({ ...defaultValues, deadline: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Mensagem para compartilhar</Label>
            <Textarea
              value={defaultValues.message}
              onChange={(e) =>
                onSave({ ...defaultValues, message: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
