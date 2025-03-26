import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";

export interface Guest {
  name: string;
  email?: string;
  phone?: string;
}

interface GuestImportProps {
  onImport: (guests: Guest[]) => void;
}

export default function GuestImport({ onImport }: GuestImportProps) {
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState("");

  const parseGuests = (text: string): Guest[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const guests: Guest[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(",").map((part) => part.trim());
      const [name, emailOrPhone, secondContact] = parts;

      if (!name) {
        errors.push(`Line ${index + 1}: Name is required`);
        return;
      }

      const guest: Guest = { name };

      // Try to identify email and phone
      const isEmail = (str: string) => str.includes("@");

      if (emailOrPhone) {
        if (isEmail(emailOrPhone)) {
          guest.email = emailOrPhone;
        } else {
          guest.phone = emailOrPhone;
        }
      }

      if (secondContact) {
        if (isEmail(secondContact)) {
          guest.email = secondContact;
        } else {
          guest.phone = secondContact;
        }
      }

      if (!guest.email && !guest.phone) {
        errors.push(`Line ${index + 1}: Either email or phone is required`);
        return;
      }

      guests.push(guest);
    });

    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    return guests;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const guests = parseGuests(text);
        onImport(guests);
        setError("");
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = () => {
    try {
      const guests = parseGuests(bulkText);
      onImport(guests);
      setError("");
      setBulkText("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label>Upload CSV File</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  Upload CSV or text file
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  Format: name, email/phone, phone/email
                </span>
              </div>
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Paste Guest List</Label>
          <Textarea
            placeholder="Enter one guest per line: name, email/phone, phone/email
Example:
John Doe, john@email.com, +1234567890
Jane Smith, +9876543210, jane@email.com"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleBulkImport} className="w-full">
            Import Guests
          </Button>
        </div>
      </div>
    </div>
  );
}
