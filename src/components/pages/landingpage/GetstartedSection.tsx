"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui-tools/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useUserPortfolio } from "@/context/UserPortfolioContext";

export default function GetStartedSection() {
  const router = useRouter();
  const { isLogged } = useAuth();
  const { userPortfolioId, createPortfolio, isLoading: isPortfolioLoading } = useUserPortfolio();
  const [isCreating, setIsCreating] = useState(false);

  const handleGetStarted = async () => {
    if (!isLogged) {
      router.push("/signup");
      return;
    }

    if (userPortfolioId) {
      router.push("/studio");
      return;
    }

    setIsCreating(true);
    try {
      await createPortfolio("DRAFT");
      router.push("/studio");
    } catch (error) {
      console.error("Failed to create portfolio", error);
    } finally {
      setIsCreating(false);
    }
  };

  const isLoading = isPortfolioLoading || isCreating;

  return (
    <section>
      <div className="bg-primary w-full py-16 flex flex-col justify-center items-center text-center">
        <h2 data-aos="fade-up" className="max-w-md  text-3xl sm:text-5xl font-bold text-title">
          Start Creating And Build Portfolio.
        </h2>
        <p data-aos="fade-up" className="max-w-lg text-description text-sm sm:text-md px-2 mb-10 mt-5">
          Start With A Full Landing Page Or Craft Custom Sections - Your Design, Your Rules!
        </p>
        <Button
          data-aos="fade-up"
          variant="fill"
          size={"large"}
          className="uppercase"
          onClick={handleGetStarted}
          disabled={isLoading}
        >
          {isCreating ? "Creating..." : "Get Started"}
        </Button>
      </div>
    </section>
  );
}
