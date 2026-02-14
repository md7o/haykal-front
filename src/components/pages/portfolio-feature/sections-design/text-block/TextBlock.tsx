export interface TextBlockConfig {
  title: string;
  description: string;
  alignment?: "left" | "center" | "right";
  style?: "with-background" | "without-background";
  textColor?: string;
}

export default function TextBlock({
  config,
  view = "desktop",
  asset,
}: {
  config: TextBlockConfig;
  view?: "desktop" | "mobile";
  asset?: unknown;
}) {
  const { title, description, alignment = "center", style = "without-background", textColor = "text-portf-text-light" } = config;

  const containerWidth = view === "desktop" ? "max-w-[50rem]" : "w-full px-5";
  const titleSize = view === "mobile" ? "text-2xl" : "sm:text-4xl text-3xl";
  const descSize = view === "mobile" ? "text-sm" : "text-base";

  const alignClass = alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";
  const wrapperClass = style === "with-background" ? "p-8 rounded-base bg-portf-primary" : "p-0";

  return (
    <section className={`${containerWidth} mx-auto`}>
      <div className={`${wrapperClass} ${alignClass}`}>
        {title ? (
          <h2
            className={`${titleSize} font-semibold ${style === "with-background" ? "text-portf-text-light" : "text-portf-text-dark"} dark:text-portf-text-light-dark mb-3 break-words whitespace-normal font-portf-font`}
          >
            {title}
          </h2>
        ) : null}
        {description ? (
          <p
            className={`${descSize} ${style === "with-background" ? "text-portf-text-light" : "text-portf-text-dark"} break-words whitespace-normal font-portf-font`}
          >
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
