import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: "/assets/svg/chart.svg",
    title: "Built-in Analytics",
    description: "Track views, clicks, and engagement.",
  },
  {
    icon: "/assets/svg/mobile.svg",
    title: "Mobile Optimized",
    description: "Looks great on any device.",
  },
  {
    icon: "/assets/svg/booking.svg",
    title: "Calendar Synchronization",
    description: "Let clients book appointments without leaving your page.",
  },
  {
    icon: "/assets/svg/details.svg",
    title: "Theme Engine",
    description: "Change colors, fonts globally.",
  },
];

function FeatureCard({ icon, title, description }: Feature) {
  return (
    <Card
      data-aos="fade-up"
      className="sm:w-[35rem] w-[20rem] border border-border shadow-sm rounded-xl hover:shadow-md transition"
    >
      <CardContent className="flex items-center p-2 sm:p-5 space-x-1 sm:space-x-5">
        <Image width={100} height={100} src={icon} alt={title} className="sm:w-32 w-18 sm:h-32 h-18 text-accent" />
        <div className="text-left space-y-1">
          <h3 className="text-2xl text-title font-semibold">{title}</h3>
          <p className="text-lg text-description">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeaturesSection() {
  return (
    <div className="text-center" id="features">
      <h2 className="text-4xl font-bold text-title mb-3">Features</h2>
      <p className="title-description">Built-in features that make your portfolio stand out.</p>

      <div className="flex flex-col items-center gap-3 mt-8">
        {features.map((f, i) => {
          // Render the pair (indices 1 and 2) as a grouped row when i === 1
          if (i === 1) {
            return (
              <div key={`pair-1-2`} className="flex flex-col xl:flex-row gap-3 w-full">
                {features.slice(1, 3).map((f2) => (
                  <div key={f2.title} className="flex-1 flex justify-center">
                    <FeatureCard {...f2} />
                  </div>
                ))}
              </div>
            );
          }

          // Skip index 2 because it's handled by the grouped row above
          if (i === 2) return null;

          // For first and last items render alone
          return (
            <div key={f.title} className="flex justify-center w-full">
              <FeatureCard {...f} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
