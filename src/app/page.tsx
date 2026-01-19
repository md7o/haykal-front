import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Header";
import AdvantagesSection from "@/components/pages/landingpage/AdvantagesSection";
// import ExplanationSection from "@/components/pages/landingpage/ExplanationSection";
// import FeaturesSection from "@/components/pages/landingpage/FeaturesSection";
import HeroSection from "@/components/pages/landingpage/HeroSection";
import ResponsiveSection from "@/components/pages/landingpage/ResponsiveSection";
import ToolsSection from "@/components/pages/landingpage/ToolsSection";

export default function Home() {
  return (
    <main className="space-y-30">
      <HeroSection />
      <div id="why-us">
        <h3 className="text-4xl font-bold text-center mb-5">Why Us ?</h3>
        <AdvantagesSection />
      </div>
      {/* <ExplanationSection /> */}
      {/* <FeaturesSection /> */}
      <div id="tools">
        <h3 className="text-4xl font-bold text-center mb-5">Tools</h3>
        <ToolsSection />
      </div>
      <ResponsiveSection />
      <div className="space-y-0">
        <Footer />
      </div>
    </main>
  );
}
