import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import EventTypeSelector from "./EventTypeSelector";
import { BasicDetailsForm } from "./BasicDetailsForm";
import GuestManagement from "./GuestManagement";
import ShareInvites from "./ShareInvites";
import EventPage from "./EventPage";
import AuthDialog from "../auth/AuthDialog";
import { useI18n } from "@/lib/i18n";
import { setPageTitle } from "@/lib/utils/page-title";

interface EventCreationWizardProps {
  onComplete?: (eventData: any) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const EventCreationWizard = ({
  onComplete = () => {},
  currentStep = 1,
  onStepChange = () => {},
}: EventCreationWizardProps) => {
  const { t } = useI18n();
  const [step, setStep] = useState(currentStep);
  const [showEventPage, setShowEventPage] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [eventData, setEventData] = useState({
    type: "",
    basicDetails: {
      title: "",
      description: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      location: "",
      maxCapacity: 100,
      bannerImage: "",
    },
    customization: {
      date: new Date(),
      startTime: "",
      endTime: "",
      location: "",
      maxCapacity: 100,
    },
    guests: [],
    saveTheDate: {
      deadline: "",
      message: "",
    },
    temporaryEventId: "",
  });

  const steps = [
    { id: 1, title: t("wizard.step1") },
    { id: 2, title: t("wizard.step2") },
    { id: 3, title: t("wizard.step3") },
    { id: 4, title: t("wizard.step4") },
  ];

  // Load saved data on component mount
  useEffect(() => {
    setPageTitle("Criar Evento");
    loadSavedEventData();
    checkAuthStatus();
    createTemporaryEvent();
  }, []);

  const loadSavedEventData = () => {
    const savedEventData = localStorage.getItem("eventCreationData");
    const savedStep = localStorage.getItem("eventCreationStep");

    if (savedEventData && savedStep) {
      try {
        console.log("Restoring saved event data", savedEventData, savedStep);
        const parsedData = JSON.parse(savedEventData);
        setEventData(parsedData);
        setStep(parseInt(savedStep));

        // Clear the saved data after restoring it
        localStorage.removeItem("eventCreationData");
        localStorage.removeItem("eventCreationStep");
      } catch (error) {
        console.error("Error restoring event creation data:", error);
      }
    }
  };

  const checkAuthStatus = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log(
      "Auth check in EventCreationWizard:",
      session ? "Logged in" : "Not logged in",
    );
  };

  const createTemporaryEvent = async () => {
    try {
      // Check if we already have a temporary event ID in localStorage
      const savedTempEventId = localStorage.getItem("temporaryEventId");
      if (savedTempEventId) {
        console.log("Using existing temporary event ID:", savedTempEventId);
        setEventData((prev) => ({
          ...prev,
          temporaryEventId: savedTempEventId,
        }));
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Create a temporary event even without a session
      // We'll use a placeholder user ID if no session exists
      const userId = session?.user?.id || "temp-user-id";

      // Create a temporary event
      const tempTitle = "Temporary event";
      const { data: event, error } = await supabase
        .from("events")
        .insert([
          {
            title: tempTitle,
            description: "",
            event_type: "temp",
            date: new Date().toISOString(),
            time: "19:00",
            location: "",
            is_private: false,
            user_id: userId,
            created_by: userId,
            is_temporary: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating temporary event:", error);
        return;
      }

      console.log("Created temporary event:", event);
      localStorage.setItem("temporaryEventId", event.id);
      setEventData((prev) => ({ ...prev, temporaryEventId: event.id }));
    } catch (error) {
      console.error("Error in createTemporaryEvent:", error);
    }
  };

  const saveCurrentState = () => {
    localStorage.setItem("eventCreationData", JSON.stringify(eventData));
    localStorage.setItem("eventCreationStep", step.toString());
    console.log("Saved event data to localStorage", eventData);
  };

  const handleNext = async () => {
    console.log(
      "handleNext called, current step:",
      step,
      "eventData:",
      eventData,
    );

    // Validate current step
    if (step === 1 && !eventData.type) {
      console.error("Selecione um tipo de evento antes de continuar");
      return;
    }

    // Validate step 2 (basic details)
    if (step === 2) {
      if (
        !eventData.basicDetails.title ||
        eventData.basicDetails.title.length < 2
      ) {
        console.error(
          "O título do evento é obrigatório e deve ter pelo menos 2 caracteres",
        );
        return;
      }

      if (!eventData.basicDetails.description) {
        console.error("A descrição do evento é obrigatória");
        return;
      }
    }

    // Check authentication for step 1 to 2 transition
    if (step === 1) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        saveCurrentState();
        setShowAuthDialog(true);
        return;
      }
    }

    // Handle normal step progression
    if (step < steps.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      onStepChange(nextStep);
      return;
    }

    // Handle final step submission
    await createEvent();
  };

  const createEvent = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        console.error("No user session found");
        return;
      }

      // Validate required fields
      if (!eventData.type || !eventData.basicDetails?.title) {
        console.error("Missing required fields");
        return;
      }

      // Prepare event date
      const eventDate = eventData.customization?.date || new Date();
      const [hours, minutes] = (
        eventData.customization?.startTime || "19:00"
      ).split(":");
      const formattedDate = new Date(eventDate);
      formattedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const eventToCreate = {
        title: eventData.basicDetails.title,
        description: eventData.basicDetails.description || "",
        event_type: eventData.type,
        date: formattedDate.toISOString(),
        start_date: formattedDate.toISOString(),
        time: eventData.customization?.startTime || "19:00",
        location: eventData.customization?.location || "",
        is_private: eventData.basicDetails.isPrivate || false,
        user_id: session.user.id,
        created_by: session.user.id,
        image_url: eventData.customization?.bannerImage || null,
        save_the_date_deadline: eventData.saveTheDate?.deadline
          ? new Date(eventData.saveTheDate.deadline).toISOString()
          : null,
        save_the_date_message: eventData.saveTheDate?.message || null,
        is_temporary: false,
      };

      console.log("Creating/updating event with data:", eventToCreate);

      let eventId;

      if (eventData.temporaryEventId) {
        // Update the temporary event instead of creating a new one
        const { data: updatedEvent, error } = await supabase
          .from("events")
          .update(eventToCreate)
          .eq("id", eventData.temporaryEventId)
          .select()
          .single();

        if (error) throw error;
        eventId = updatedEvent.id;
        console.log("Temporary event updated successfully:", updatedEvent);
      } else {
        // Create a new event if no temporary event exists
        const { data: newEvent, error } = await supabase
          .from("events")
          .insert([eventToCreate])
          .select()
          .single();

        if (error) throw error;
        eventId = newEvent.id;
        console.log("Event created successfully:", newEvent);
      }

      // Clear the temporary event ID from localStorage
      localStorage.removeItem("temporaryEventId");

      onComplete(eventData);
      window.location.href = `/events/${eventId}`;
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAuthComplete = () => {
    console.log("Auth completed, continuing to next step");
    setShowAuthDialog(false);

    // After successful authentication, move to next step
    if (step < steps.length) {
      const nextStep = step + 1;
      console.log(`Setting next step to ${nextStep}`);
      setStep(nextStep);
      onStepChange(nextStep);
    }
  };

  const handleBasicDetailsSubmit = (values: any) => {
    console.log("Basic details values:", values);
    
    setEventData((prev) => ({
      ...prev,
      basicDetails: {
        title: values.title,
        description: values.description,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        location: values.location,
        maxCapacity: values.maxCapacity,
        bannerImage: values.bannerImage,
      },
      customization: {
        ...prev.customization,
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        location: values.location,
        maxCapacity: values.maxCapacity,
      },
      saveTheDate: values.saveTheDate || {
        deadline: "",
        message: "",
      },
    }));

    console.log("Moving to next step");
    setStep(3);
  };

  if (showEventPage) {
    return (
      <EventPage
        event={{
          title: eventData.basicDetails.title || "Novo Evento",
          description: eventData.basicDetails.description,
          date: eventData.customization?.date || new Date(),
          time: eventData.customization?.startTime || "19:00",
          location: eventData.customization?.location || "Localização Ausente",
          organizer: {
            name: "Você",
            email: "seu@email.com",
          },
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <Card className="max-w-[1200px] mx-auto p-4 sm:p-6 bg-white">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile Stepper */}
          <div className="md:hidden">
            <div className="flex items-center justify-center mb-4">
              <span className="text-sm font-medium">
                {step} / {steps.length}: {steps[step - 1]?.title}
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${(step / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Desktop Stepper */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`flex-1 relative ${s.id !== steps.length ? "after:content-[''] after:h-1 after:w-full after:bg-gray-200 after:absolute after:top-1/2 after:left-1/2 after:-translate-y-1/2 after:z-0" : ""}`}
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.id ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                      {s.id}
                    </div>
                    <span
                      className={`mt-2 text-sm ${step >= s.id ? "text-primary" : "text-gray-500"}`}
                    >
                      {s.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {step === 1 && (
            <EventTypeSelector
              onSelect={(type) => {
                console.log(
                  "EventTypeSelector onSelect called with type:",
                  type,
                );
                setEventData({ ...eventData, type });
              }}
              selectedType={eventData.type}
            />
          )}
          {step === 2 && (
            <div className="space-y-8">
              <BasicDetailsForm
                onSubmit={handleBasicDetailsSubmit}
                defaultValues={{
                  title: eventData.basicDetails?.title,
                  description: eventData.basicDetails?.description,
                  date: eventData.basicDetails?.date,
                  startTime: eventData.basicDetails?.startTime,
                  endTime: eventData.basicDetails?.endTime,
                  location: eventData.basicDetails?.location,
                  maxCapacity: eventData.basicDetails?.maxCapacity,
                  bannerImage: eventData.basicDetails?.bannerImage,
                  saveTheDate: eventData.saveTheDate,
                }}
              />
            </div>
          )}
          {step === 3 && (
            <GuestManagement
              eventId={eventData.temporaryEventId}
              onInvite={(method, guests) => {
                if (eventData.temporaryEventId) {
                  setEventData({
                    ...eventData,
                    guests: [...eventData.guests, ...guests],
                  });
                }
              }}
            />
          )}
          {step === 4 && (
            <ShareInvites
              eventId="abc123" // This should be the actual event ID
              saveTheDate={eventData.saveTheDate || { message: "" }}
              onShare={(method) =>
                setEventData({
                  ...eventData,
                  sharing: { ...eventData.sharing, sharedVia: method },
                })
              }
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            {t("wizard.back")}
          </Button>
          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {step === steps.length ? t("wizard.finish") : t("wizard.next")}
          </Button>
        </div>
      </Card>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={(open) => {
          console.log("Auth dialog onOpenChange", open);
          setShowAuthDialog(open);
        }}
        onComplete={handleAuthComplete}
      />
    </div>
  );
};

export default EventCreationWizard;
