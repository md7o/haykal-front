import { Card, CardContent } from "@/components/ui-tools/ui/card";
import { Button } from "@/components/ui-tools/ui/button";
import Link from "next/link";
import {
  FileText,
  Eye,
  List,
  Star,
  MapPin,
  Code,
  Users,
  QrCode,
  ShieldCheck,
  MessageCircle,
  Cpu,
  Calendar,
  BarChart2,
  Layout,
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
    icon: Code,
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
    icon: Code,
    link: "/ai-tool",
    items: [
      { icon: FileText, text: "Enter a raw idea. Get a clean, structured concept." },
      { icon: Eye, text: "See what your idea is and what it is not." },
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
  return (
    <section className="flex sm:flex-row flex-col justify-center gap-3 p-6">
      {toolCards.map((card, idx) => {
        return (
          <Card key={card.id} data-aos="fade-up" data-aos-delay={idx * 120} className="rounded-soft text-center w-full max-w-md">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 justify-center">
                  <h3 className="text-3xl font-semibold ">{card.emoji ? `${card.emoji} ${card.title}` : card.title}</h3>
                </div>

                <p className="text-sm text-description">{card.description}</p>

                <Button size="base" asChild>
                  <Link href={card.link}>{card.cta.label}</Link>
                </Button>

                <div className="flex items-center gap-3 my-2">
                  <span className="flex-1 h-px bg-main-border" />
                  <span className="text-xs text-muted-foreground">What does the tool do?</span>
                  <span className="flex-1 h-px bg-main-border" />
                </div>

                <ol className="list-none space-y-2">
                  {card.items.map((it, i) => {
                    const Icon = it.icon;
                    return (
                      <li key={i} className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-accent mt-1" />
                        <span className="text-sm">{it.text}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
