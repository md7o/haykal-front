import { Card, CardContent } from "@/components/ui/card";
import {
  ClockFading,
  MousePointerClick,
  ChartColumnBig,
  PenTool,
} from "lucide-react";

const features = [
  {
    icon: ClockFading,
    title: "Zero Setup Starter",
    description:
      "Choose category, pick a layout, customize sections and styles",
  },
  {
    icon: MousePointerClick,
    title: "One-Click Publish",
    description:
      "Publish instantly with a shareable link and set your free subdomain",
  },
  {
    icon: ChartColumnBig,
    title: "Audience Analytics",
    description: " Track visits, clicks, and engagement with clean charts.",
  },
  {
    icon: PenTool,
    title: "Section Designer",
    description:
      "Multiple layout variants per section, global styles, desktop & mobile preview",
  },
];

export default function AdvantagesSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-6 max-w-5xl mx-auto">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            data-aos-duration="1500"
            className="border border-border shadow-sm rounded-xl hover:shadow-md transition"
          >
            <CardContent className="flex items-center text-center pr-5 py-2 space-y-4">
              <Icon className="w-20 h-20 text-accent" />
              <div className="text-left px-5 space-y-1">
                <h3 className="text-2xl text-title font-semibold">
                  {feature.title}
                </h3>
                <p className="text-lg text-description">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
