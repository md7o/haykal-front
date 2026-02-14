"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui-tools/ui/button";

export interface EventsConfig {
  imageSrc: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  layout?: "row" | "column";
  eventDate?: string; // ISO string or yyyy-MM-ddTHH:mm
  countdownStyle?: "background" | "text";
}

function useCountdown(target?: string) {
  const targetTime = useMemo(() => {
    if (!target) return null;
    const t = new Date(target);
    return isNaN(t.getTime()) ? null : t.getTime();
  }, [target]);

  const calc = () => {
    if (!targetTime) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };
    const now = Date.now();
    const diff = Math.max(targetTime - now, 0);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, done: diff === 0 };
  };

  const [state, setState] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setState(calc), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTime]);

  return state;
}

export default function EventsBlock({
  config,
  view = "desktop",
  asset,
}: {
  config: EventsConfig;
  view?: "desktop" | "mobile";
  asset?: unknown;
}) {
  const { imageSrc, title, description, ctaLabel, ctaLink, layout = "row", eventDate, countdownStyle = "background" } = config;

  const { days, hours, minutes, seconds } = useCountdown(eventDate);

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

  const ImageCard = imageSrc ? (
    <div className="flex items-center justify-center">
      <Image src={imageSrc} alt={title || "Event"} width={800} height={600} className={imageClasses} />
    </div>
  ) : null;

  const TextContent = (
    <div className={`space-y-4 ${isColumn ? "text-center" : "text-left"}`}>
      <h2 className={`${titleSize} font-semibold text-portf-text-dark font-portf-font break-words`}>{title}</h2>
      {description ? <p className={`${descSize} text-portf-text-dark font-portf-font break-words`}>{description}</p> : null}
      {/* Countdown */}
      {countdownStyle === "background" ? (
        <div
          className={`grid grid-cols-4 gap-1 ${view === "desktop" ? "w-1/2 mx-auto" : ""} ${
            isColumn ? "justify-items-center" : ""
          }`}
        >
          {[
            { label: "Days", value: days },
            { label: "Hours", value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds },
          ].map((itm) => (
            <div key={itm.label} className="bg-portf-primary rounded-base p-3 w-full text-center">
              <div className={`${view === "mobile" ? "text-xl" : "text-2xl"} font-semibold `}>
                {String(itm.value).padStart(2, "0")}
              </div>
              <div className=" text-xs">{itm.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${isColumn ? "justify-center" : ""} flex items-baseline font-semibold`}>
          <span className={`${view === "mobile" ? "text-xl" : "text-2xl"}`}>
            {String(days).padStart(2, "0")}:{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      )}
      {ctaLabel ? (
        ctaLink ? (
          <a href={ctaLink} target="_blank" rel="noopener noreferrer">
            <Button variant="link" className="p-0 text-portf-text-dark">
              {ctaLabel}
            </Button>
          </a>
        ) : (
          <Button variant="link" className="p-0 text-portf-text-dark">
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
