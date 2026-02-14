"use client";

import Image from "next/image";
import { Button } from "@/components/ui-tools/ui/button";

export interface ServiceItem {
  id: string;
  imageSrc: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface BusinessServicesConfig {
  items: ServiceItem[];
}

function ServiceCard({ item, view }: { item: ServiceItem; view: "desktop" | "mobile" }) {
  const isColumn = true;
  const titleSize = view === "mobile" ? "text-base" : "text-xl";
  const descSize = view === "mobile" ? "text-xs" : "text-sm";

  const ImageCard = item.imageSrc ? (
    <div className=" flex items-center justify-center">
      <Image
        src={item.imageSrc}
        alt={item.title || "Service"}
        width={400}
        height={400}
        className={`rounded-base ${view === "mobile" ? "w-full max-w-[20rem]" : "w-[14rem]"}`}
      />
    </div>
  ) : null;

  const Text = (
    <div className={`space-y-2 ${isColumn ? "text-center" : "text-left"}`}>
      <h3 className={`${titleSize} font-bold font-portf-font text-portf-text-light break-words`}>{item.title}</h3>
      {item.description ? (
        <p className={`${descSize} font-portf-font text-portf-text-light-dark break-words`}>{item.description}</p>
      ) : null}
      {item.ctaLabel ? (
        item.ctaLink ? (
          <a
            href={item.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 underline text-base bg-transparent rounded-soft"
          >
            {item.ctaLabel}
          </a>
        ) : (
          <Button variant="link" className="p-0 text-sm">
            {item.ctaLabel}
          </Button>
        )
      ) : null}
    </div>
  );

  return (
    <div className={`bg-portf-primary rounded-base py-8`}>
      {isColumn ? (
        <div className="flex flex-col items-stretch gap-4">
          {ImageCard}
          {Text}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {ImageCard}
          {Text}
        </div>
      )}
    </div>
  );
}

export default function BusinessServicesBlock({
  config,
  view = "desktop",
  asset,
}: {
  config: BusinessServicesConfig;
  view?: "desktop" | "mobile";
  asset?: unknown;
}) {
  const containerWidth = view === "desktop" ? "max-w-[60rem]" : "w-full px-5";
  const gridCols = view === "mobile" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3";

  return (
    <section className={`${containerWidth} mx-auto`}>
      <div className={`grid ${gridCols} gap-5`}>
        {config.items?.map((item) => (
          <ServiceCard key={item.id} item={item} view={view} />
        ))}
      </div>
    </section>
  );
}
