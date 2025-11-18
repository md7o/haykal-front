"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Copy, QrCode, Share2, Check, Facebook, Twitter, Linkedin, Mail, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPortfolioById } from "@/api/portfolio-endpoints";

interface ShareButtonProps {
  portfolioId?: string;
  className?: string;
  children?: React.ReactNode;
}

const socialMediaPlatforms = [
  {
    name: "Facebook",
    icon: Facebook,
    getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: "hover:bg-[#1877f2]/10",
  },
  {
    name: "Twitter",
    icon: Twitter,
    getUrl: (url: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    color: "hover:bg-[#1da1f2]/10",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    getUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: "hover:bg-[#0077b5]/10",
  },
  {
    name: "Email",
    icon: Mail,
    getUrl: (url: string) => `mailto:?subject=Check out my portfolio&body=${encodeURIComponent(url)}`,
    color: "hover:bg-accent/10",
  },
];

export default function ShareButton({ portfolioId, className, children }: ShareButtonProps) {
  const [showQR, setShowQR] = useState(true);
  const [showSocial, setShowSocial] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Resolve url part (prefer backend slug when available) and build full URL
  const [urlPart, setUrlPart] = useState<string | null>(portfolioId ?? null);

  useEffect(() => {
    let active = true;
    if (!portfolioId) {
      setUrlPart(null);
      return;
    }

    // Try to fetch backend portfolio to prefer its slug
    (async () => {
      try {
        const p = await getPortfolioById(String(portfolioId));
        if (!active) return;
        setUrlPart(p && p.slug ? String(p.slug) : String(portfolioId));
      } catch {
        if (!active) return;
        setUrlPart(String(portfolioId));
      }
    })();

    return () => {
      active = false;
    };
  }, [portfolioId]);

  const portfolioUrl = typeof window !== "undefined" && urlPart ? `${window.location.origin}/portfolio/${urlPart}` : "";

  // Reset state when dialog opens (QR active by default)
  useEffect(() => {
    if (open) {
      setShowQR(true);
      setShowSocial(false);
      setCopied(false);
    }
  }, [open]);

  // Generate QR code when QR view is shown
  useEffect(() => {
    if (showQR && qrCanvasRef.current && portfolioUrl) {
      generateQRCode(portfolioUrl, qrCanvasRef.current);
    }
  }, [showQR, portfolioUrl]);

  // Ensure QR is generated when dialog opens (canvas may mount after state changes)
  useEffect(() => {
    if (!open) return;
    if (!portfolioUrl) return;
    // give the DOM a tick to mount the canvas (works across browsers)
    const id = window.requestAnimationFrame
      ? window.requestAnimationFrame(() => {
          if (qrCanvasRef.current) generateQRCode(portfolioUrl, qrCanvasRef.current);
        })
      : window.setTimeout(() => {
          if (qrCanvasRef.current) generateQRCode(portfolioUrl, qrCanvasRef.current);
        }, 0);

    return () => {
      if (typeof id === "number") window.cancelAnimationFrame?.(id as number);
    };
  }, [open, portfolioUrl]);

  const handleCopy = async () => {
    if (!portfolioUrl) return;
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSocialShare = (platform: (typeof socialMediaPlatforms)[0]) => {
    if (!portfolioUrl) return;
    window.open(platform.getUrl(portfolioUrl), "_blank", "noopener,noreferrer");
  };

  const toggleQR = () => {
    setShowQR(true);
    setShowSocial(false);
  };

  const toggleSocial = () => {
    setShowSocial(true);
    setShowQR(false);
  };

  const handleOpen = async () => {
    if (!portfolioId) return;

    try {
      // prefer backend slug if available
      try {
        const p = await getPortfolioById(String(portfolioId));
        const urlPart = p && p.slug ? String(p.slug) : String(portfolioId);
        window.open(`${window.location.origin}/portfolio/${urlPart}`, "_blank", "noopener,noreferrer");
      } catch (err) {
        // on any error, fallback to using the id
        window.open(`${window.location.origin}/portfolio/${String(portfolioId)}`, "_blank", "noopener,noreferrer");
      }
    } finally {
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

        <div>
          <div className="flex justify-between items-center gap-2 bg-white rounded-soft px-3 py-1">
            <div className="w-full">
              <p className="text-sm font-semibold text-title ">{portfolioUrl || "No portfolio available"}</p>
            </div>
            <Button
              variant="grayFill"
              size="flexible"
              onClick={handleCopy}
              disabled={!portfolioUrl}
              className={cn("", copied ? "bg-accent/10 hover:bg-accent/10" : "hover:scale-105")}
            >
              {copied ? (
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-accent" /> <span className="text-description text-xs">Copied!</span>
                </div>
              ) : (
                <Copy className="size-4 text-title/70" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col gap-1">
          <Button variant={showQR ? "fill" : "transparent"} size="base" onClick={toggleQR} disabled={!portfolioUrl} className="">
            <QrCode className="size-4" />
            QR Code
          </Button>
          <Button variant={showSocial ? "fill" : "transparent"} size="base" onClick={toggleSocial} disabled={!portfolioUrl}>
            <Share2 className="size-4" />
            Social Share
          </Button>
          <Button variant="transparent" size="base" onClick={handleOpen} disabled={!portfolioUrl}>
            <ExternalLink className="size-4" />
            Open
          </Button>
        </div>

        {/* Conditional Content */}
        {showQR && (
          <div className="flex flex-col items-center space-y-4 pt-4 pb-2">
            <div className="rounded-base  bg-white p-6 shadow-sm">
              <canvas ref={qrCanvasRef} className="w-44 h-44" width="200" height="200" />
            </div>
            <p className="text-sm text-description font-medium">Scan to visit portfolio</p>
          </div>
        )}

        {showSocial && (
          <div className="space-y-2.5 pt-4">
            {socialMediaPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.name}
                  variant={"grayFill"}
                  onClick={() => handleSocialShare(platform)}
                  disabled={!portfolioUrl}
                  className={cn(" w-full flex justify-between items-center")}
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

// Simple QR Code generator using canvas
function generateQRCode(text: string, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const size = 200;
  const qrSize = 25; // 25x25 modules
  const moduleSize = size / qrSize;

  // Clear canvas
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Generate a simple QR-like pattern based on text hash
  ctx.fillStyle = "#000000";

  // Create a simple pattern based on the text
  const hash = simpleHash(text);
  const pattern = generatePattern(hash, qrSize);

  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (pattern[row][col]) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  // Add finder patterns (corners)
  drawFinderPattern(ctx, 0, 0, moduleSize);
  drawFinderPattern(ctx, (qrSize - 7) * moduleSize, 0, moduleSize);
  drawFinderPattern(ctx, 0, (qrSize - 7) * moduleSize, moduleSize);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generatePattern(hash: number, size: number): boolean[][] {
  const pattern: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  let seed = hash;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Generate pattern with some randomness based on hash
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Skip finder pattern areas
      if ((i < 7 && j < 7) || (i < 7 && j >= size - 7) || (i >= size - 7 && j < 7)) {
        continue;
      }
      pattern[i][j] = random() > 0.5;
    }
  }

  return pattern;
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) {
  // Outer square (7x7)
  ctx.fillStyle = "#000000";
  ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);

  // White square (5x5)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);

  // Inner black square (3x3)
  ctx.fillStyle = "#000000";
  ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
}
