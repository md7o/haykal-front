import Footer from "@/components/layouts/Footer";
import AdvantagesSection from "@/components/pages/landingpage/AdvantagesSection";

import HeroSection from "@/components/pages/landingpage/HeroSection";
import ResponsiveSection from "@/components/pages/landingpage/ResponsiveSection";
import ToolsSection from "@/components/pages/landingpage/ToolsSection";

export default function Home() {
  return (
    <main className="space-y-30 md:space-y-50">
      <HeroSection />
      <div id="tools">
        <ToolsSection />
      </div>
      <div id="why-us">
        <AdvantagesSection />
      </div>

      <ResponsiveSection />
      <div className="space-y-0">
        <Footer />
      </div>
    </main>
  );
}
