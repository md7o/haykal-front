"use client";

import { Card, CardContent } from "@/components/ui/shadcn_ui/card";
import { Button } from "@/components/ui/shadcn_ui/button";
import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  List,
  Star,
  MapPin,
  Users,
  QrCode,
  ShieldCheck,
  MessageCircle,
  Cpu,
  Calendar,
  BarChart2,
  Layout,
  BotMessageSquare,
  Blocks,
  Info,
} from "lucide-react";

type ToolItem = { icon: any; text: string };
type ToolCard = {
  id: string;
  emoji?: string;
  title: string;
  description: string;
  cta: { label: string };
  items: ToolItem[];
  icon?: any;
  link: string;
};

const toolCards: ToolCard[] = [
  {
    id: "portfolio-builder",
    emoji: "🏗️",
    title: "Portfolio Builder",
    description: "Showcase your work with stunning, customizable portfolios.",
    cta: { label: "Get Started" },
    icon: Blocks,
    link: "/portfolio/setup",
    items: [
      {
        icon: Layout,
        text: "Dynamic Portfolio Builder: Drag-and-drop sections to showcase your work, hosted on a free custom subdomain.",
      },
      {
        icon: Calendar,
        text: "Smart Scheduling: Two-way calendar sync tailored for creators. Clients book time slots that work for you.",
      },
      {
        icon: BarChart2,
        text: "Centralized Analytics: A unified dashboard tracking idea viability, community growth, and revenue/booking stats.",
      },
    ],
  },
  {
    id: "ai-idea",
    emoji: "🧠",
    title: "Ai Idea",
    description: "Turn vague thoughts into actionable roadmaps.",
    cta: { label: "Get Started" },
    icon: BotMessageSquare,
    link: "/ai-question",
    items: [
      { icon: FileText, text: "Enter a raw idea. Get a clean, structured concept." },
      { icon: Info, text: "See what your idea is and what it is not." },
      { icon: List, text: "Receive a ranked list of features by impact." },
      { icon: Star, text: "Identify what makes your product meaningfully different." },
      { icon: MapPin, text: "Expose the market white space you can win." },
    ],
  },
  {
    id: "community-lead",
    emoji: "🤝",
    title: "Community Lead",
    description: "Engage your audience with seamless collaboration tools.",
    cta: { label: "Get Started" },
    icon: Users,
    link: "/community/setup",
    items: [
      {
        icon: QrCode,
        text: "Zero-Friction Entry: Generate Invite QR codes with customizable expiration timers for secure, temporary, or permanent access.",
      },
      {
        icon: ShieldCheck,
        text: "Granular Control: Assign roles (Admin, Moderator, Student) and manage permissions with a click.",
      },
      {
        icon: MessageCircle,
        text: "Engagement Suite: Full support for threaded discussions, polls, events, and a shared resource library.",
      },
      { icon: Cpu, text: "AI Content Helper: The built-in AI drafts engagement starters and event descriptions for you." },
    ],
  },
];

export default function ToolsSection() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggleFlip = (cardId: string) => {
    setFlipped((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const IconCardColor = (idx: number) => {
    switch (idx) {
      case 0:
        return "text-amber-300";
      case 1:
        return "text-green-300";
      case 2:
        return "text-blue-200";
      default:
        return "text-gray-500";
    }
  };

  return (
    <section>
      <h3 data-aos="fade-up" data-aos-delay={120} className="text-4xl font-bold text-center mb-5">
        Tools
      </h3>
      <div className="flex sm:flex-row flex-col justify-center gap-3 p-6">
        {toolCards.map((card, idx) => {
          const CardIcon = card.icon;
          const isFlipped = flipped[card.id];
          return (
            <div
              key={card.id}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              className="w-full max-w-sm h-85 cursor-pointer perspective"
              style={{
                perspective: "1000px",
              }}
              onClick={() => toggleFlip(card.id)}
            >
              <div
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front of card */}
                <Card
                  className="rounded-soft w-full h-full bg-card-bg absolute"
                  style={{
                    backfaceVisibility: "hidden",
                  }}
                >
                  <CardContent className="p-4 px-8 h-full flex flex-col">
                    {/* Header with icon and eye button */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-3">
                        {CardIcon && <CardIcon className={`w-10 h-10 ${IconCardColor(idx)}`} />}
                      </div>
                      <button
                        className="p-3 hover:bg-accent/10 rounded-lg transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlip(card.id);
                        }}
                      >
                        <Info className="w-5 h-5 text-accent transform " style={{ transform: "scaleX(-1)" }} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-left mb-2">{card.title}</h3>

                    {/* Description */}
                    <p className="text-md text-description text-left flex-grow">{card.description}</p>

                    {/* Button at bottom */}
                    <Button size="base" asChild className="w-full mt-4" onClick={(e) => e.stopPropagation()}>
                      <Link href={card.link}>{card.cta.label}</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Back of card */}
                <Card
                  className="rounded-soft w-full h-full bg-card-bg absolute"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <CardContent className="px-6 py-3 h-full flex flex-col overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-semibold text-accent">What does the tool do?</h4>
                      <button
                        className="p-3 hover:bg-accent/10 rounded-lg transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlip(card.id);
                        }}
                      >
                        <Info className="w-5 h-5 text-accent transform " style={{ transform: "scaleX(-1)" }} />
                      </button>
                    </div>

                    <ol className="list-none space-y-3">
                      {card.items.map((it, i) => {
                        const Icon = it.icon;
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <Icon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-tight">{it.text}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
