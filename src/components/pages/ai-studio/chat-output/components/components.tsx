"use client";

import { memo } from "react";
import { ideaType } from "@/lib/api/ai-api/idea-endpoints";

// ===== Card Styles Configuration =====
export const CARD_STYLES = {
  default: "flex flex-col space-y-2 bg-card-main p-5 rounded-soft",
  accent: "flex flex-col space-y-3 py-4",
} as const;

// ===== Types =====
interface ContentItem {
  type: "header" | "paragraph" | "title" | "list";
  content: string;
}

// ===== States =====
export const LoadingState = () => (
  <div className="flex items-center justify-center p-8" role="status" aria-label="Loading">
    <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 bg-red-500/10 rounded-base border border-red-500/20" role="alert">
    <p className="text-red-600 font-semibold">{message}</p>
  </div>
);

export const EmptyState = () => (
  <div className="p-12 text-center">
    <p className="text-description text-lg">No idea found.</p>
  </div>
);

export const NoAnalysisState = () => (
  <div className="p-6 bg-yellow-500/10 rounded-base border border-yellow-500/20">
    <p className="text-yellow-700 font-medium">No AI analysis data available yet.</p>
  </div>
);

// ===== Content Rendering =====
export const RenderContent = memo(function RenderContent({
  item,
  inline = false,
}: {
  item: string | ContentItem | Record<string, any> | null | undefined;
  inline?: boolean;
}) {
  if (!item) return null;

  if (typeof item === "string") {
    return inline ? <span className="text-description">{item}</span> : <p className="text-description leading-relaxed">{item}</p>;
  }

  if (typeof item === "object" && "type" in item && "content" in item) {
    const content = item.content;
    const display =
      typeof content === "string" ? (
        content
      ) : typeof content === "object" && content?.type ? (
        <RenderContent item={content} inline />
      ) : (
        String(content)
      );

    switch (item.type) {
      case "header":
        return <h4 className="font-bold text-title text-lg mb-2">{display}</h4>;
      case "title":
        return <h5 className="font-semibold text-title mb-1">{display}</h5>;
      case "list":
        return <span className="text-description leading-relaxed">• {display}</span>;
      default:
        return inline ? (
          <span className="text-description leading-relaxed">{display}</span>
        ) : (
          <p className="text-description leading-relaxed">{display}</p>
        );
    }
  }

  if (typeof item === "object") {
    try {
      return <span className="text-description text-sm">{JSON.stringify(item)}</span>;
    } catch {
      return <span className="text-description">Unable to render</span>;
    }
  }

  return <span className="text-description">{String(item)}</span>;
});

// ===== Section Components =====
export const SectionHeader = memo(function SectionHeader({ title }: { title: string }) {
  const iconMap: Record<string, string> = {
    "Strategic Elevation": "🚀",
    "Market Landscape": "🌍",
    "Technical Blueprint": "⚙️",
    "Resource Blueprint": "📊",
    "Execution Roadmap": "🗺️",
    "Expert Consultation": "💡",
  };

  return (
    <h2 className="text-3xl text-title font-semibold pb-3 border-b-2 border-light-border flex items-center gap-2">
      <span>{iconMap[title] || "📌"}</span>
      {title}
    </h2>
  );
});

export const SubsectionHeader = memo(function SubsectionHeader({
  title,
  variant = "default",
}: {
  title: string;
  variant?: "default" | "accent";
}) {
  return <h3 className={variant === "accent" ? " text-sm text-accent" : " text-title"}>{title}</h3>;
});

export const CompetitorCard = memo(function CompetitorCard({ competitor }: { competitor: any }) {
  return (
    <div className={CARD_STYLES.default}>
      <h4 className="font-semibold text-xl text-accent mb-3">
        <RenderContent item={competitor.name} inline />
      </h4>
      <div className="space-y-2">
        <div>
          <span className="text-base  text-accent">Weakness: </span>
          <RenderContent item={competitor.weakness} inline />
        </div>
        <div>
          <span className="text-base  text-accent">Our Edge: </span>
          <RenderContent item={competitor.your_edge} inline />
        </div>
      </div>
    </div>
  );
});

export const TechCard = memo(function TechCard({ label, item }: { label: string; item: any }) {
  return (
    <div className={CARD_STYLES.default}>
      <h4 className="text-base text-accent mb-2">{label}</h4>
      <RenderContent item={item} />
    </div>
  );
});

export const RoleItem = memo(function RoleItem({ role }: { role: any }) {
  return (
    <li className="flex items-start gap-2 text-description">
      <span className="text-accent ">●</span>
      <RenderContent item={role} inline />
    </li>
  );
});

export const PhaseItem = memo(function PhaseItem({ item }: { item: any }) {
  return (
    <div className={CARD_STYLES.default}>
      <RenderContent item={item} />
    </div>
  );
});

// ===== Data Components =====
export const ProjectDetails = memo(function ProjectDetails({ details }: { details: Record<string, string> }) {
  if (!details || Object.keys(details).length === 0) return null;

  return (
    <div className={`${CARD_STYLES.accent} space-y-5 pt-20`}>
      <h3 className="text-3xl font-semibold border-b-2 border-light-border pb-3">👤 Your Answers</h3>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex flex-col space-y-1 bg-card-main p-5 rounded-soft">
            <h4 className="text-xs uppercase text-accent">{key.replace(/_/g, " ").slice(2, 40)}</h4>
            <p className="text-sm text-description leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

export const RawDataViewer = memo(function RawDataViewer({ data }: { data: ideaType }) {
  return (
    <div className={CARD_STYLES.accent}>
      <details className="cursor-pointer group">
        <summary className="font-semibold text-title hover:text-accent transition-colors select-none">
          <span className="group-open:hidden">▶ View Raw Data</span>
          <span className="hidden group-open:inline">▼ Hide Raw Data</span>
        </summary>
        <div className="mt-4 p-4 bg-card-bg rounded-soft overflow-auto max-h-96">
          <pre className="text-xs text-description whitespace-pre-wrap break-words">{JSON.stringify(data, null, 2)}</pre>
        </div>
      </details>
    </div>
  );
});
