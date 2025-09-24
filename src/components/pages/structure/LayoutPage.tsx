"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useStructureContext } from "@/context/StructureContext";
import { useRouter } from "next/navigation";

export default function LayoutPage() {
  const duration = "duration-200";
  const router = useRouter();
  const { selectedLayout, setSelectedLayout } = useStructureContext();
  const layoutType = [
    {
      name: "Landing Page type",
      description: "Pre-built sections for work education, and skills.",
      img: "/assets/Images/dashboard.png",
    },
    {
      name: "Sections",
      description: "Testimonials, case studies, and service grids.",
      img: "/assets/Images/dashboard.png",
    },
  ];

  return (
    <div
      className="flex flex-col w-full my-5 relative"
      onClick={(e) => {
        if (e.currentTarget === e.target) setSelectedLayout(null);
      }}
    >
      {/* Header */}
      <div className="text-center mt-10">
        <h1 className="text-title font-bold mb-4 text-3xl sm:text-4xl md:text-5xl">🎨 Build Your Masterpiece</h1>
        <p className="text-description mb-10 text-lg md:text-xl">
          Start with a full Landing Page or craft custom Sections – your design, your rules!
        </p>
      </div>

      {/* Layout options */}
      <div className="flex min-h-[60vh] items-center justify-center w-full lg:mb-0 mb-20 px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 max-w-6xl mx-auto">
          {layoutType.map((layout) => (
            <button
              key={layout.name}
              type="button"
              tabIndex={0}
              aria-pressed={selectedLayout === layout.name}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLayout(layout.name === "Landing Page type" ? ("Landingpage" as const) : ("Sections" as const));
              }}
              className={`group relative w-full max-w-[360px] sm:w-[360px] h-[400px] rounded-strong shadow-lg p-6 transition-all ${duration} ease-in-out hover:shadow-2xl category-gradient flex flex-col items-center justify-start mx-auto outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-white/80 cursor-pointer ${
                selectedLayout === layout.name
                  ? "ring-4 ring-[#c66754] scale-[0.96] animate-[lightpulse_2s_cubic-bezier(0.4,_0,_0.6,_1)_infinite] z-10"
                  : "ring-0 hover:ring-2 hover:ring-[#c66754]/50"
              }`}
            >
              {/* Selection indicator */}
              {selectedLayout === layout.name && (
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

              {/* Layout image */}
              <div
                className={`w-full h-[280px] mb-4 bg-white/10 rounded-2xl p-4 flex items-center justify-center transition-all ${duration} ${
                  selectedLayout === layout.name ? "bg-white/20 ring-2 ring-white/30" : "group-hover:bg-white/15"
                }`}
              >
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <Image
                    fill
                    priority
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (min-width: 768px) 50vw"
                    src={layout.img}
                    alt={layout.name}
                  />
                </div>
              </div>

              {/* Text content */}
              <div className="flex flex-col items-start text-left z-10 w-full flex-grow justify-center">
                <h2
                  className={`text-xl sm:text-2xl font-bold text-white drop-shadow break-words w-full mb-2 transition-all ${duration} ${
                    selectedLayout === layout.name ? "text-white" : "group-hover:text-white/90"
                  }`}
                >
                  {layout.name}
                </h2>
                <p
                  className={`text-sm sm:text-base md:text-lg text-white/90 leading-snug break-words w-full transition-all ${duration} ${
                    selectedLayout === layout.name ? "text-white/95" : "group-hover:text-white/80"
                  }`}
                >
                  {layout.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <div
        className={`fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-50 transition-all ${duration} ${
          selectedLayout ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <Button
          size="large"
          className="pointer-events-auto mb-8 py-3 shadow-lg md:border-0 border-2 border-white/60 bg-accent transition-all duration-200"
          onClick={async () => {
            if (!selectedLayout) return;

            router.push("/studio");
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
