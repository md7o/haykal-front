"use client";

import { useStructureContext } from "@/context/StructureContext";
import { BriefcaseBusiness, Video, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CategoryPage() {
  const duration = "duration-200";
  const iconSize = 48;
  const router = useRouter();
  const { selectedCategory, setSelectedCategory } = useStructureContext();
  const categoryType = [
    {
      name: "Personal",
      description: "Pre-built sections for work education, and skills.",
      icon: <UserRound size={iconSize} />,
    },
    {
      name: "Business",
      description: "Testimonials, case studies, and service grids.",
      icon: <BriefcaseBusiness size={iconSize} />,
    },
    {
      name: "Creator",
      description: "Showcase merch, sponsors, and embed content (videos, photo).",
      icon: <Video size={iconSize} />,
    },
  ];

  const [isSaving] = useState(false);
  const [saveError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedCategory) return;
    router.push("/layout-type");
  };

  return (
    <div
      className="flex flex-col w-full my-5 relative"
      onClick={(e) => {
        if (e.currentTarget === e.target) setSelectedCategory(null);
      }}
    >
      <div className="text-center mt-10">
        <h1 className="text-title font-bold mb-4 text-3xl sm:text-4xl md:text-5xl">Define Your Space!</h1>
        <p className="text-description mb-10 text-lg md:text-2xl ">Optimize your experience</p>
      </div>
      <div className="flex min-h-[60vh] items-center justify-center w-full lg:mb-0 mb-20 px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 max-w-6xl mx-auto">
          {categoryType.map((cat) => (
            <button
              key={cat.name}
              type="button"
              tabIndex={0}
              aria-pressed={selectedCategory === cat.name}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(cat.name as any);
              }}
              className={`group relative w-full max-w-[280px] sm:w-[280px] h-[280px] rounded-strong shadow-lg p-6 transition-all ${duration} ease-in-out  hover:shadow-2xl category-gradient flex flex-col justify-end mx-auto outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-white/80 cursor-pointer ${
                selectedCategory === cat.name
                  ? "ring-4 ring-[#c66754] scale-[0.96] animate-[lightpulse_2s_cubic-bezier(0.4,_0,_0.6,_1)_infinite] z-10"
                  : "ring-0 hover:ring-2 hover:ring-[#c66754]/50"
              }`}
            >
              {/* Selection indicator */}
              {selectedCategory === cat.name && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#c66754] rounded-full flex items-center justify-center z-20 animate-bounce">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              <div className={`absolute top-8 right-8 text-white drop-shadow-lg transition-all ${duration} `}>{cat.icon}</div>

              <div className="flex flex-col items-start z-10 w-full">
                <h2
                  className={`text-2xl sm:text-3xl font-bold text-white mb-2 text-left drop-shadow break-words w-full transition-all ${duration} ${
                    selectedCategory === cat.name ? "text-white" : "group-hover:text-white/90"
                  }`}
                >
                  {cat.name}
                </h2>
                <p
                  className={`text-base md:text-lg text-white/90 text-left leading-snug break-words w-full transition-all ${duration} ${
                    selectedCategory === cat.name ? "text-white/95" : "group-hover:text-white/80"
                  }`}
                >
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Animated button at bottom */}
      <div
        className={`fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-50 transition-all ${duration} ${
          selectedCategory ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <Button
          size={"large"}
          className="pointer-events-auto mb-8 py-3 shadow-lg md:border-0 border-2 border-white/60 bg-accent transition-all duration-200 "
          onClick={handleContinue}
          disabled={!selectedCategory || isSaving}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
