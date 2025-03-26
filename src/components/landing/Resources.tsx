import { Card } from "@/components/ui/card";
import { Calendar, Users, Bell, Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Resources() {
  const { t } = useI18n();
  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: t("resources.feature1.title"),
      description: t("resources.feature1.description"),
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: t("resources.feature2.title"),
      description: t("resources.feature2.description"),
    },
    {
      icon: <Bell className="h-10 w-10 text-primary" />,
      title: t("resources.feature3.title"),
      description: t("resources.feature3.description"),
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: t("resources.feature4.title"),
      description: t("resources.feature4.description"),
    },
  ];

  return (
    <section id="recursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{t("resources.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("resources.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 flex flex-col items-center text-center bg-card hover:shadow-md transition-shadow"
            >
              <div className="mb-4 p-3 bg-primary/10 rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
