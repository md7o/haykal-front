"use client";

import { Plus, Presentation } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/shadcn_ui/dialog";
import { Button } from "@/components/ui/shadcn_ui/button";
import { Input } from "@/components/ui/shadcn_ui/input";
import { Label } from "@/components/ui/shadcn_ui/label";
import AlertStatus from "@/components/ui/custom_ui/AlertsStatu";
import { createPortfolio, getAllPortfolios, Portfolio } from "@/api/portfolios-api/portfolio-endpoints";
import { useRouter } from "next/navigation";
import { useUserPortfolio } from "@/lib/context/UserPortfolioContext";
import { createPage } from "@/api/portfolios-api/pages-endpoints";

export default function PortfSetup() {
  const [portfolioSlug, setPortfolioSlug] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [existingPortfolios, setExistingPortfolios] = useState<Portfolio[]>([]);

  const router = useRouter();
  const { accessToken, user } = useAuthStore();
  const { refreshPortfolioId } = useUserPortfolio();

  const slugPreview = useMemo(() => portfolioSlug.trim() || "your-portfolio", [portfolioSlug]);

  const handleCreatePortfolio = async () => {
    if (!accessToken) {
      setShowLoginPrompt(true);
      return;
    }

    const slug = portfolioSlug.trim();
    if (!slug) return;

    setIsCreating(true);
    try {
      const portfolio = await createPortfolio(user?.userId || "", portfolioSlug.trim());

      // Create default Home page (backend should do this, but ensure it here)
      if (portfolio?.id) {
        await createPage(portfolio.id, { slug: "home" });
      }

      setShowSuccess(true);
      setPortfolioSlug("");

      // Refresh portfolio ID in context
      await refreshPortfolioId();

      // Redirect to the studio editor for the newly created portfolio
      router.push(`/portfolio/studio/${portfolio.id}`);
    } catch (err) {
      console.error("Portfolio creation failed:", err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const portfolios = await getAllPortfolios();
        setExistingPortfolios(portfolios);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
      }
    };

    fetchPortfolios();

    if (showSuccess) {
      const t = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-card-main">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-title mb-2">Portfolio Setup Page</h1>
        <p>Welcome to the portfolio setup page. Here you can configure your portfolio settings.</p>
      </div>

      <div className="flex justify-center items-center gap-5 flex-wrap max-w-5xl">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Add"
              className="group w-60 h-70 cursor-pointer flex items-center justify-center border-1 border-dashed border-accent rounded-soft text-accent hover:bg-accent/10 hover:scale-103 duration-200"
            >
              <Plus className="group-hover:scale-120 duration-300" size={50} />
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-accent">Create your portfolio</DialogTitle>
              <DialogDescription className="text-description flex flex-col ">
                Your portfolio name will appear in the URL
                <span className="font-medium text-title">/portfolio/{slugPreview}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="my-2">
              <Label htmlFor="portfolio-slug" className="px-1 py-3">
                Portfolio Name
              </Label>
              <Input
                id="portfolio-slug"
                value={portfolioSlug}
                onChange={(e) => setPortfolioSlug(e.target.value)}
                placeholder="e.g., my-portfolio"
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={handleCreatePortfolio} disabled={!portfolioSlug.trim() || isCreating}>
                  {isCreating ? "Creating..." : "Confirm"}
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="grayFill">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="flex flex-wrap justify-center gap-4">
          {existingPortfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              onClick={() => router.push(`/portfolio/studio/${portfolio.id}`)}
              className="group w-60 h-70 cursor-pointer flex flex-col justify-center items-center gap-2 bg-accent rounded-soft hover:scale-105 duration-200 transition-all shadow-md hover:shadow-lg"
            >
              <Presentation className="group-hover:scale-120 duration-300" size={40} />
              <span className="text-white text-lg font-semibold text-center px-3 line-clamp-2 capitalize">{portfolio.slug}</span>
            </div>
          ))}
        </div>
      </div>

      {showSuccess && (
        <AlertStatus
          variant="success"
          title="Portfolio created"
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
          autoHide={3000}
        />
      )}

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-accent">Login Required</DialogTitle>
            <DialogDescription className="text-description mt-2">
              You need to be logged in to create a portfolio. Please log in to your account to continue.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => router.push("/login?next=portfolio/setup")} className="w-full">
              Go to Login
            </Button>
            <DialogClose asChild>
              <Button variant="grayFill">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
