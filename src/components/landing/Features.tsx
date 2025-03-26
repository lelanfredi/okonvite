import { Card } from "@/components/ui/card";
import { Calendar, Users, Bell, Share2 } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "Crie eventos em minutos",
      description:
        "Organize aniversários, festas temáticas ou eventos corporativos com nosso assistente intuitivo.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Gerencie convidados",
      description:
        "Envie convites, acompanhe confirmações e organize informações dos seus convidados em um só lugar.",
    },
    {
      icon: <Bell className="h-10 w-10 text-primary" />,
      title: "Lembretes automáticos",
      description:
        "Envie lembretes personalizados para seus convidados e garanta maior presença no seu evento.",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "Compartilhe facilmente",
      description:
        "Compartilhe seu evento nas redes sociais ou envie o link diretamente para seus convidados.",
    },
  ];

  return (
    <section id="recursos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Tudo que você precisa para seu evento
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            O Konvite simplifica todo o processo de organização, desde o
            planejamento até o grande dia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
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
