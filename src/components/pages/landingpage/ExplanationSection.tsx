import { Button } from "@/components/ui/button";
import { User, BriefcaseBusiness, CirclePlay } from "lucide-react";
import Image from "next/image";

const featuresList = [
  {
    icon: User,
    title: "Personal",
    description:
      "Resume style sections for work, education, skills + contact & socials.",
    color: "text-blue-500",
  },
  {
    icon: BriefcaseBusiness,
    title: "Business",
    description:
      "Client focused layouts with testimonials, services, booking, and pricing.",
    color: "text-orange-600",
  },
  {
    icon: CirclePlay,
    title: "Creator",
    description:
      "Showcase merch, sponsors, and embed content (videos, blogs, podcasts).",
    color: "text-red-400",
  },
];

export default function ExplanationSection() {
  return (
    <div className="bg-primary w-full">
      {/* === Part One === */}
      <div
        data-aos="fade-up"
        className="  flex flex-col xl:flex-row items-center justify-center gap-14 px-6 text-center xl:text-left py-10"
      >
        <div className="relative max-w-lg space-y-5">
          <h1 className="text-title sm:text-5xl text-4xl font-bold relative">
            Pick & Customize Sections
          </h1>
          <p className="text-description">
            Simple steps to create you portfolio
          </p>
          <Image
            src="/assets/images/BlueSparkle.png"
            alt="Jeddah Albalad Logo"
            width={500}
            height={500}
            className="w-14 absolute right-25 xl:left-50 bottom-18 hidden sm:block"
          />
          <Button variant="fill" size={"base"} className="uppercase">
            try for free
          </Button>
        </div>
        <div className="flex justify-center items-center bg-secondary sm:w-82 w-72 sm:h-82 h-72 rounded-full ">
          <Image
            src={"/assets/images/Drag.png"}
            alt="Drag Preview"
            property="true"
            width={500}
            height={500}
            className="w-[18rem] sm:w-[25rem] relative top-3 hover:scale-95 duration-300"
          />
        </div>
      </div>
      {/* === Part Two === */}
      <div
        data-aos="fade-up"
        className=" flex flex-col xl:flex-row-reverse items-center justify-center gap-14 xl:gap-50 px-6 text-center xl:text-left py-10"
      >
        <div className="relative max-w-md space-y-5">
          <h1 className="text-title sm:text-5xl text-4xl font-bold relative">
            Choose Your Space To Fit Your Experience
          </h1>
          <ul className="space-y-5">
            {featuresList.map((feature, index) => (
              <li key={index} className="flex flex-col items-left space-x-3">
                <div className="flex flex-row items-start gap-3">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  <div className="flex flex-col text-left">
                    <span className="text-xl text-title font-bold">
                      {feature.title}
                    </span>
                    <span className="text-description">
                      {feature.description}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Image
            src="/assets/images/BlueSparkle.png"
            alt="Jeddah Albalad Logo"
            width={500}
            height={500}
            className="w-14 absolute right-10 xl:left-62 top-24 hidden sm:block"
          />
        </div>
        <div className="relative bg-secondary sm:w-82 w-72 sm:h-82 h-72 rounded-full overflow-visible">
          <Image
            src="/assets/images/Categories.png"
            alt="Categories"
            width={500}
            height={500}
            className="absolute right-5 -bottom-1 hover:scale-95 duration-300"
          />
        </div>
      </div>
    </div>
  );
}
