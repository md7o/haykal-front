import Footer from "@/components/layouts/Footer";
import Navbar from "@/components/layouts/Header";
import AdvantagesSection from "@/components/pages/landingpage/AdvantagesSection";
import ExplanationSection from "@/components/pages/landingpage/ExplanationSection";
import FeaturesSection from "@/components/pages/landingpage/FeaturesSection";
import GetStartedSection from "@/components/pages/landingpage/GetstartedSection";
import HeroSection from "@/components/pages/landingpage/HeroSection";
import ResponsiveSection from "@/components/pages/landingpage/ResponsiveSection";

export default function Home() {
  return (
    <main className="space-y-10">
      <div className="bg-primary space-y-10 pb-16">
        <Navbar />
        <HeroSection />
      </div>
      <AdvantagesSection />
      <ExplanationSection />
      <FeaturesSection />
      <ResponsiveSection />
      <div className="space-y-0">
        <GetStartedSection />
        <Footer />
      </div>
    </main>
  );
}
