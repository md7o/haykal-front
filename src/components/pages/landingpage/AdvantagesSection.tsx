import { Card, CardContent } from "@/components/ui/shadcn_ui/card";
import {
  Smartphone,
  RefreshCw,
  Zap,
  Layers,
  GraduationCap,
  Layout,
  QrCode,
  ShieldCheck,
  MessageCircle,
  Cpu,
  Calendar,
  BarChart2,
} from "lucide-react";

type Item = { icon: any; text: string };
type CardData = {
  id: string;
  bgClass: string;
  title: string;
  topIcon: any;
  items: Item[];
  textColor?: string;
};

const cards: CardData[] = [
  {
    id: "adaptive",
    bgClass: "bg-[#EA9C53]",
    textColor: "text-white",
    title: "Adaptive & Responsive Design",
    topIcon: Smartphone,
    items: [
      {
        icon: Smartphone,
        text: "Device Agnostic: Seamless experience from mobile screens to 4K monitors.",
      },
      { icon: RefreshCw, text: "Real-Time Sync: Switch between phone, tablet, and desktop without losing a beat." },
      { icon: Zap, text: "Fluid Performance: Lightweight architecture for fast loading on any connection." },
    ],
  },
  {
    id: "custom",
    bgClass: "bg-[#E65858]",
    textColor: "text-white",
    title: "Radical Simplicity",
    topIcon: Layers,
    items: [
      { icon: Zap, text: "Pure No-Code: Complex backend power hidden behind an intuitive, simple UI." },
      { icon: GraduationCap, text: "One Learning Curve: Master one tool and you’ve mastered the entire ecosystem." },
      { icon: Layout, text: "Unified Dashboard: Manage ideas, members, and bookings from a single view." },
    ],
  },
  {
    id: "community",
    bgClass: "bg-[#6C8EF5]",
    textColor: "text-white",
    title: "Community Controls",
    topIcon: MessageCircle,
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
    ],
  },
  {
    id: "portfolio",
    bgClass: "bg-[#4CC9B1]",
    textColor: "text-white",
    title: "Portfolio Power",
    topIcon: Layers,
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
];

export default function AdvantagesSection() {
  return (
    <section>
      <h3 data-aos="fade-up" data-aos-delay={120} className="text-3xl font-semibold text-center mb-4">
        Why Us?
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 p-4 max-w-4xl mx-auto">
        {cards.map((c, idx) => {
          const TopIcon = c.topIcon;
          return (
            <Card
              key={c.id}
              data-aos="fade-up"
              data-aos-delay={idx * 80}
              className={`p-4 ${c.bgClass} ${c.textColor ?? "text-foreground"}`}
            >
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-md bg-white/20">
                  <TopIcon className={` ${c.textColor ? "text-white" : "text-foreground"}`} size={28} />
                </div>

                <h3 className={`text-xl font-semibold ${c.textColor ?? "text-title"}`}>{c.title}</h3>

                <ol className="list-none space-y-2 mt-1 w-full">
                  {c.items.map((it, i) => {
                    const Icon = it.icon;
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 mt-1 ${c.textColor ? "text-white/90" : "text-foreground/70"}`} />
                        <span className={`${c.textColor ?? "text-description"} text-sm`}>{it.text}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
