import { Button } from "@/components/ui-tools/ui/button";
import Image from "next/image";

export interface HeroConfig {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaLink?: string;
  backgroundImage: string;
  alignment: "left" | "right";
  color?: string;
  size?: "small" | "medium" | "large";
  layoutDirection?: "dir-left" | "dir-right";
}

interface HeroDesignProps {
  config: HeroConfig;
  view?: "desktop" | "mobile";
  asset?: unknown;
}

export default function HeroBlock({ config, view = "desktop", asset }: HeroDesignProps) {
  const {
    heading,
    subheading,
    ctaLabel,
    backgroundImage,
    alignment = "left",
    size = "medium",
    layoutDirection = "dir-right",
    ctaLink,
  } = config;
  const headingSize = view === "mobile" ? "text-4xl" : size === "large" ? "sm:text-8xl text-7xl" : "sm:text-7xl text-6xl";

  // Responsive alignment based on view prop and actual screen size
  const getAlignmentClasses = () => {
    if (view === "mobile") {
      return "text-center"; // Always center in mobile view
    }
    // Desktop view or real responsive behavior
    return alignment === "left" ? "text-center xl:text-left" : "text-center xl:text-right";
  };

  const alignmentClasses = getAlignmentClasses();
  const isImageLeft = layoutDirection === "dir-left";

  // Layout classes based on view
  const layoutClasses = view === "mobile" ? "flex flex-col gap-10" : "flex flex-col xl:flex-row gap-24";
  const imageSize = view === "mobile" ? "w-64" : "xl:w-[30rem] w-[20rem]";

  const buttonStyle = "uppercase bg-portf-primary";
  return (
    <section className={`${layoutClasses} items-center justify-center 2xl:mx-auto mx-36`}>
      {isImageLeft ? (
        <>
          <div className={`${imageSize} overflow-hidden rounded-soft hover:scale-95 duration-300`}>
            <Image src={backgroundImage} alt="Hero" priority width={500} height={500} className="w-full h-full object-cover" />
          </div>

          <div className={`relative space-y-5 ${alignmentClasses}`}>
            <h1 className={`text-portf-text-dark font-bold font-portf-font relative ${headingSize}`}>{config.heading}</h1>
            <p className="text-portf-text-dark font-portf-font">{config.subheading}</p>
            {config.ctaLink ? (
              <a href={config.ctaLink} target="_blank" rel="noopener noreferrer">
                <Button variant="block" size={"small"} className={buttonStyle}>
                  {ctaLabel}
                </Button>
              </a>
            ) : (
              <Button variant="block" size={"small"} className={buttonStyle}>
                {ctaLabel}
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={`relative max-w-lg space-y-5 ${alignmentClasses}`}>
            <h1 className={`text-portf-text-dark font-bold font-portf-font relative ${headingSize}`}>{heading}</h1>
            <p className="text-portf-text-dark font-portf-font">{subheading}</p>
            {ctaLink ? (
              <a href={ctaLink} target="_blank" rel="noopener noreferrer">
                <Button variant="block" size={"small"} className={buttonStyle}>
                  {ctaLabel}
                </Button>
              </a>
            ) : (
              <Button variant="block" size={"small"} className={buttonStyle}>
                {ctaLabel}
              </Button>
            )}
          </div>
          <div className={`${imageSize} overflow-hidden rounded-soft hover:scale-95 duration-300`}>
            <Image
              src={backgroundImage || "/assets/images/placeholder.png"}
              alt="Hero"
              priority
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>
        </>
      )}
    </section>
  );
}
