"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Copy, QrCode, Share2, Check, Facebook, Twitter, Linkedin, Mail, ExternalLink, ChevronRight } from "lucide-react";
import { getPortfolioById } from "@/api/portfolio-endpoints";
import { useUserPortfolio } from "@/context/UserPortfolioContext";

interface ShareButtonProps {
  portfolioId?: string;
  className?: string;
  children?: React.ReactNode;
}

const SOCIAL_PLATFORMS = [
  {
    name: "Facebook",
    icon: Facebook,
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  { name: "Twitter", icon: Twitter, getUrl: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` },
  {
    name: "LinkedIn",
    icon: Linkedin,
    getUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Email",
    icon: Mail,
    getUrl: (url: string) => `mailto:?subject=Check out my portfolio&body=${encodeURIComponent(url)}`,
  },
];

export default function ShareButton({ portfolioId, className, children }: ShareButtonProps) {
  const [showQR, setShowQR] = useState(true);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { portfolioData } = useUserPortfolio();

  useEffect(() => {
    if (!portfolioId) {
      setPortfolioUrl("");
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const portfolio = await getPortfolioById(String(portfolioId));
        const urlPart = portfolio?.slug || portfolioId;
        setPortfolioUrl(typeof window !== "undefined" ? `${window.location.origin}/portfolio/${urlPart}` : "");
      } catch {
        setPortfolioUrl(typeof window !== "undefined" ? `${window.location.origin}/portfolio/${portfolioId}` : "");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [portfolioId]);

  useEffect(() => {
    if (open) {
      setShowQR(true);
      setCopied(false);
    }
  }, [open]);

  const handleCopy = async () => {
    if (!portfolioUrl) return;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const toggleView = (showQr: boolean) => setShowQR(showQr);

  const handleSocialShare = (platform: (typeof SOCIAL_PLATFORMS)[0]) => {
    if (portfolioUrl) window.open(platform.getUrl(portfolioUrl), "_blank", "noopener,noreferrer");
  };

  const handleOpenPortfolio = () => {
    if (portfolioUrl) {
      window.open(portfolioUrl, "_blank");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="grayFill" size="small" className={className}>
            <Share2 className="size-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-none shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-title">Share Portfolio</DialogTitle>
          <DialogDescription className="text-sm text-description">Share your site with others.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center gap-2 bg-white rounded-soft px-3 py-1">
          <p className="text-sm font-semibold text-title">{portfolioUrl || "No portfolio available"}</p>
          <Button
            variant="transparent"
            size="flexible"
            onClick={handleCopy}
            disabled={!portfolioUrl}
            className={copied ? "" : "hover:scale-90"}
          >
            {copied ? (
              <div className="flex items-center gap-1">
                <Check className="size-4 text-accent" />
                <span className="text-description text-xs">Copied!</span>
              </div>
            ) : (
              <Copy className="size-4 text-title/70" />
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <Button variant={showQR ? "fill" : "transparent"} size="base" onClick={() => toggleView(true)} disabled={!portfolioUrl}>
            <QrCode className="size-4" />
            QR Code
          </Button>
          <Button
            variant={showQR ? "transparent" : "fill"}
            size="base"
            onClick={() => toggleView(false)}
            disabled={!portfolioUrl}
          >
            <Share2 className="size-4" />
            Social Share
          </Button>
          <Button variant="transparent" size="base" onClick={handleOpenPortfolio} disabled={!portfolioUrl}>
            <ExternalLink className="size-4" />
            Open
          </Button>
        </div>

        {showQR && (
          <div className="flex flex-col items-center">
            <div className="rounded-base bg-white p-2">
              {portfolioUrl ? (
                <QRCodeSVG value={portfolioUrl} size={220} level="H" includeMargin={true} />
              ) : (
                <div className="w-44 h-44 bg-gray-200 rounded flex items-center justify-center text-description">
                  {isLoading ? "Generating..." : "No URL"}
                </div>
              )}
            </div>
            <p className="text-sm text-description mt-5">Scan to visit portfolio</p>
          </div>
        )}

        {!showQR && (
          <div className="space-y-2 pt-2">
            {SOCIAL_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.name}
                  variant="grayFill"
                  onClick={() => handleSocialShare(platform)}
                  disabled={!portfolioUrl}
                  className="w-full flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-title/80 group-hover:text-accent transition-colors" />
                    <span className="text-sm font-semibold text-title/90 group-hover:text-accent transition-colors">
                      {platform.name}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-title/80 group-hover:text-accent transition-colors" />
                </Button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
