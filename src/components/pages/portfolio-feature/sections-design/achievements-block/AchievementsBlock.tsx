import Image from "next/image";
import { Button } from "@/components/ui-tools/ui/button";

export interface AchievementsConfig {
  imageSrc: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  layout?: "row" | "column"; // row = image beside text, column = image above text
}

export default function AchievementsBlock({
  config,
  view = "desktop",
}: {
  config: AchievementsConfig;
  view?: "desktop" | "mobile";
}) {
  const { imageSrc, title, description, ctaLabel, ctaLink, layout = "row" } = config;

  // Width constraints using Theme.css tokens via utility classes present elsewhere
  const containerWidth = view === "desktop" ? "max-w-[60rem]" : "w-full px-5";

  const isColumn = layout === "column";
  const wrapperClasses =
    view === "mobile"
      ? "flex flex-col gap-6"
      : isColumn
      ? "flex flex-col gap-8"
      : "flex flex-col xl:flex-row items-center gap-10";

  const titleSize = view === "mobile" ? "text-2xl" : "sm:text-4xl text-3xl";
  const descSize = view === "mobile" ? "text-sm" : "text-base";

  const imageClasses = view === "mobile" ? "w-full max-w-xs mx-auto rounded-base" : "w-[22rem] rounded-base";

  // Card wrapper for image
  const ImageCard = imageSrc ? (
    <div className="flex items-center justify-center">
      <Image src={imageSrc} alt={title || "Achievement"} width={800} height={600} className={imageClasses} />
    </div>
  ) : null;

  const TextContent = (
    <div className={`space-y-4 ${isColumn ? "text-center" : "text-left"}`}>
      <h2 className={`${titleSize} font-semibold text-title break-words`}>{title}</h2>
      {description ? <p className={`${descSize} text-description break-words`}>{description}</p> : null}
      {ctaLabel ? (
        ctaLink ? (
          <a href={ctaLink} target="_blank" rel="noopener noreferrer">
            <Button variant="link" className="p-0">
              {ctaLabel}
            </Button>
          </a>
        ) : (
          <Button variant="link" className="p-0">
            {ctaLabel}
          </Button>
        )
      ) : null}
    </div>
  );

  return (
    <section className={`${containerWidth} mx-auto`}>
      <div className={`${wrapperClasses}`}>
        {isColumn ? (
          <>
            {ImageCard}
            {TextContent}
          </>
        ) : (
          <>
            {ImageCard}
            <div className="flex-1 min-w-0">{TextContent}</div>
          </>
        )}
      </div>
    </section>
  );
}
