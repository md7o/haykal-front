export interface TextBlockConfig {
  title: string;
  description: string;
  alignment?: "left" | "center" | "right";
  style?: "with-background" | "without-background";
  textColor?: string;
}

export default function TextBlock({ config, view = "desktop" }: { config: TextBlockConfig; view?: "desktop" | "mobile" }) {
  const { title, description, alignment = "center", style = "without-background", textColor } = config;

  const containerWidth = view === "desktop" ? "max-w-[50rem]" : "w-full px-5";
  const titleSize = view === "mobile" ? "text-2xl" : "sm:text-4xl text-3xl";
  const descSize = view === "mobile" ? "text-sm" : "text-base";

  const alignClass = alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";
  const wrapperClass = style === "with-background" ? "p-8 rounded-base bg-card-bg" : "p-0";

  return (
    <section className={`${containerWidth} mx-auto`}>
      <div className={`${wrapperClass} ${alignClass}`}>
        {title ? <h2 className={`${titleSize} font-semibold ${textColor} mb-3 break-words whitespace-normal`}>{title}</h2> : null}
        {description ? <p className={`${descSize} ${textColor}/50 break-words whitespace-normal`}>{description}</p> : null}
      </div>
    </section>
  );
}
