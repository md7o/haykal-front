import HeroDesign from "../hero-block/HeroBlock";
import HeroForm, { HeroConfig } from "../hero-block/HeroBlockForm";
import SocialLinksBlock from "../sociallinks-block/SocialLinksBlock";
import SocialLinksForm from "../sociallinks-block/SocialLinksBlockForm";
import CareerBlock from "../career-block/CareerBlock";
import CareerBlockForm from "../career-block/CareerBlockForm";
import TextBlock from "../text-block/TextBlock";
import TextBlockForm, { TextBlockConfig } from "../text-block/TextBlockForm";
import AchievementsBlock from "../achievements-block/AchievementsBlock";
import AchievementsBlockForm, { AchievementsConfig } from "../achievements-block/AchievementsBlockForm";
import EventsBlock from "../events-block/EventsBlock";
import EventsBlockForm, { EventsConfig } from "../events-block/EventsBlockForm";
import BusinessServicesBlock from "../business-services-block/BusinessServicesBlock";
import BusinessServicesBlockForm, { BusinessServicesConfig } from "../business-services-block/BusinessServicesBlockForm";

export interface SectionDefinition {
  type: string;
  label: string;
  defaultConfig: unknown;
  Design: React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>;
  Form: React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>;
  validate?: (config: unknown) => string[];
}

export const sectionsRegistry: Record<string, SectionDefinition> = {
  hero: {
    type: "hero",
    label: "Hero",
    defaultConfig: {
      heading: "Design Your Portfolio",
      subheading: "Total control, zero complexity",
      ctaLabel: "Get started",
      backgroundImage: "/assets/images/Placeholder.png",
      alignment: "left",
      color: "#fa6b77",
    } satisfies HeroConfig,
    Design: HeroDesign as unknown as React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>,
    Form: HeroForm as unknown as React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>,
    validate: (c: unknown) => {
      const cfg = c as HeroConfig;
      const errs: string[] = [];
      if (!cfg.heading) errs.push("Heading is required");
      if (!cfg.ctaLabel) errs.push("CTA label required");
      return errs;
    },
  },

  socialLinks: {
    type: "socialLinks",
    label: "Social Links",
    defaultConfig: {
      socialLinks: ["https://youtube.com", "https://instagram.com", "https://github.com"],
    },
    Design: SocialLinksBlock as unknown as React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>,
    Form: SocialLinksForm as unknown as React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>,
  },

  career: {
    type: "career",
    label: "Career",
    defaultConfig: {
      title: "Senior Software Engineer",
      facilityName: "Haykal Inc.",
      location: "Riyadh, SA",
      date: "June 2023 - Present",
      note: "Led development of scalable web applications using React and Node.js. Mentored junior developers and implemented CI/CD pipelines that reduced deployment time by 60%.",
      careerType: "experience-career",
    },
    Design: CareerBlock as unknown as React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>,
    Form: CareerBlockForm as unknown as React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>,
  },

  text: {
    type: "text",
    label: "Text",
    defaultConfig: {
      title: "Section Title",
      description: "This is a simple text block that you can use to introduce sections.",
      alignment: "center",
      style: "without-background",
    } satisfies TextBlockConfig,
    Design: TextBlock as unknown as React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>,
    Form: TextBlockForm as unknown as React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>,
    validate: (c: unknown) => {
      const cfg = c as TextBlockConfig;
      const errs: string[] = [];
      if (!cfg.title && !cfg.description) errs.push("Provide a title or a description");
      return errs;
    },
  },

  achievements: {
    type: "achievements",
    label: "Achievements",
    defaultConfig: {
      imageSrc: "/assets/images/Placeholder.png",
      title: "Our Achievement",
      description: "A short highlight or milestone description goes here.",
      ctaLabel: "Learn More",
      ctaLink: "#",
      layout: "row",
    } satisfies AchievementsConfig,
    Design: AchievementsBlock as unknown as React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>,
    Form: AchievementsBlockForm as unknown as React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>,
    validate: (c: unknown) => {
      const cfg = c as AchievementsConfig;
      const errs: string[] = [];
      if (!cfg.title) errs.push("Title is required");
      if (!cfg.imageSrc) errs.push("Image is required");
      return errs;
    },
  },

  events: {
    type: "events",
    label: "Event",
    defaultConfig: {
      imageSrc: "/assets/images/Placeholder.png",
      title: "Upcoming Event",
      description: "Join us for an amazing event you won't want to miss.",
      ctaLabel: "Register",
      ctaLink: "#",
      layout: "column",
      eventDate: "2030-01-01T00:00",
      countdownStyle: "background",
    } satisfies EventsConfig,
    Design: EventsBlock as unknown as React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>,
    Form: EventsBlockForm as unknown as React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>,
    validate: (c: unknown) => {
      const cfg = c as EventsConfig;
      const errs: string[] = [];
      if (!cfg.title) errs.push("Title is required");
      if (!cfg.imageSrc) errs.push("Image is required");
      if (!cfg.eventDate) errs.push("Event date is required");
      return errs;
    },
  },

  businessServices: {
    type: "businessServices",
    label: "Business Services",
    defaultConfig: {
      layout: "column",
      items: [
        {
          id: "svc-1",
          imageSrc: "/assets/images/Placeholder.png",
          title: "Consulting",
          description: "Expert guidance to accelerate your business.",
          ctaLabel: "Learn More",
          ctaLink: "#",
        },
        {
          id: "svc-2",
          imageSrc: "/assets/images/Placeholder.png",
          title: "Design",
          description: "Beautiful, functional designs tailored to you.",
          ctaLabel: "Learn More",
          ctaLink: "#",
        },
        {
          id: "svc-3",
          imageSrc: "/assets/images/Placeholder.png",
          title: "Development",
          description: "Robust and scalable engineering solutions.",
          ctaLabel: "Explore",
          ctaLink: "#",
        },
      ],
    } satisfies BusinessServicesConfig,
    Design: BusinessServicesBlock as unknown as React.ComponentType<{ config: unknown; view?: "desktop" | "mobile" }>,
    Form: BusinessServicesBlockForm as unknown as React.ComponentType<{ config: unknown; onChange: (config: unknown) => void }>,
    validate: (c: unknown) => {
      const cfg = c as BusinessServicesConfig;
      const errs: string[] = [];
      if (!cfg.items || cfg.items.length === 0) errs.push("Add at least one service item");
      for (const s of cfg.items || []) {
        if (!s.title) errs.push("Each service needs a title");
        if (!s.imageSrc) errs.push("Each service needs an image");
      }
      return errs;
    },
  },
};

export type SectionType = keyof typeof sectionsRegistry;

export function createSectionInstance(type: SectionType) {
  const def = sectionsRegistry[type];
  return {
    id: crypto.randomUUID(),
    type: def.type,
    name: def.label,
    config: { ...(def.defaultConfig as Record<string, unknown>) },
  };
}
