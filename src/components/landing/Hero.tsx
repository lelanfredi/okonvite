import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import EventCreationWizard from "../event/EventCreationWizard";
import { useI18n } from "@/lib/i18n";

export default function Hero() {
  const { t } = useI18n();
  return (
    <div className="relative isolate px-4 sm:px-6 pt-14 lg:px-8">
      {/* Hero Section */}
      <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
              onClick={() => {
                const wizard = document.getElementById("event-wizard");
                if (wizard) {
                  wizard.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {t("hero.button")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Event Creation Wizard Section */}
      <div id="event-wizard" className="py-6 sm:py-12">
        <EventCreationWizard />
      </div>
    </div>
  );
}
