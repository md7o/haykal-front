"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Edit2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStudio } from "@/context/StudioContext";
import { createCustomDesign, updatePortfolio } from "@/api/portfolio-endpoints";
import { usePublishedDesign } from "@/context/PublishedDesignContext";

interface ColorCombo {
  name: string;
  primary: string;
  secondary: string;
}

export default function ThemeContent() {
  // Applied (currently active in DOM)
  const [appliedComboIndex, setAppliedComboIndex] = useState<number>(0);
  const [appliedFont, setAppliedFont] = useState<string>("");
  // Pending (selected but not yet applied)
  const [pendingComboIndex, setPendingComboIndex] = useState<number>(0);
  const [pendingFont, setPendingFont] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();
  const { customDesignId, setCustomDesignId, portfolioId, assets: ctxAssets } = useStudio();
  const { refresh } = usePublishedDesign();

  const colorCombinations: ColorCombo[] = useMemo(
    () => [
      { name: "Default", primary: "", secondary: "" },
      { name: "Sunset", primary: "#9b671f", secondary: "#fffae5" },
      { name: "Forest", primary: "#29746f", secondary: "#e0fff8" },
      { name: "Ocean", primary: "#276e94", secondary: "#ddeeff" },
      { name: "Night", primary: "#2c3e50", secondary: "#d0d8eb" },
      { name: "Pinky", primary: "#4b2c50", secondary: "#ffeafd" },
      { name: "Redy", primary: "#6d1818", secondary: "#ffdddd" },
      { name: "Oily", primary: "#45502c", secondary: "#edfcd9" },
      { name: "Dirty", primary: "#50422c", secondary: "#fff9ea" },
    ],
    []
  );

  const fontOptions = useMemo(
    () => [
      { label: "Montserrat", value: '"Montserrat", sans-serif' },
      { label: "Roboto", value: '"Roboto", sans-serif' },
      { label: "Lobster", value: '"lobster", Montserrat' },
      { label: "Inconsolata", value: '"inconsolata", Montserrat' },
      { label: "Tagesschrift", value: '"tagesschrift", Montserrat' },
      { label: "Caveat", value: '"caveat", Montserrat' },
    ],
    []
  );

  useEffect(() => {
    // Prefer assets from StudioContext if available (persisted or hydrated),
    // otherwise fall back to computed styles / session draft.
    if (ctxAssets) {
      try {
        const palette = (ctxAssets as any).palette || {};
        const font = (ctxAssets as any).font;
        const primary = (palette.primary || "").trim();
        const secondary = (palette.secondary || "").trim();
        const matchIdx = colorCombinations.findIndex((c) => c.primary.trim() === primary && c.secondary.trim() === secondary);
        const idx = matchIdx >= 0 ? matchIdx : 0;
        setAppliedComboIndex(idx);
        setPendingComboIndex(idx);
        if (font) {
          setAppliedFont(font);
          setPendingFont(font);
        }
      } catch {
        // ignore and fallback to computed styles below
      }
      return;
    }

    if (typeof window === "undefined") return;
    const bodyStyles = getComputedStyle(document.body);
    const rootStyles = getComputedStyle(document.documentElement);
    const fontVar = (
      bodyStyles.getPropertyValue("--font-montserrat-cus") ||
      bodyStyles.getPropertyValue("--font-montserrat") ||
      rootStyles.getPropertyValue("--font-montserrat-cus") ||
      rootStyles.getPropertyValue("--font-montserrat")
    ).trim();
    const resolvedFont = fontVar || '"Montserrat", sans-serif';
    setAppliedFont(resolvedFont);
    setPendingFont(resolvedFont);

    const appliedPrimary = (
      rootStyles.getPropertyValue("--color-accent-cus") ||
      rootStyles.getPropertyValue("--color-accent") ||
      ""
    ).trim();
    const appliedSecondary = (
      rootStyles.getPropertyValue("--color-card-bg-cus") ||
      rootStyles.getPropertyValue("--color-card-bg") ||
      ""
    ).trim();
    const matchIdx = colorCombinations.findIndex(
      (c) => c.primary.trim() === appliedPrimary && c.secondary.trim() === appliedSecondary
    );
    const idx = matchIdx >= 0 ? matchIdx : 0;
    setAppliedComboIndex(idx);
    setPendingComboIndex(idx);
  }, [colorCombinations, ctxAssets]);

  const applyColorsToDom = (combo: ColorCombo) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement.style;
    const primary = combo.primary.trim();
    const secondary = combo.secondary.trim();

    if (primary) {
      root.setProperty("--color-accent-cus", primary);
      root.setProperty("--color-title-cus", primary);
      root.setProperty("--primary-cus", primary);
      root.setProperty("--accent-cus", primary);
      root.setProperty("--ring-cus", primary);
    } else {
      root.removeProperty("--color-accent-cus");
      root.removeProperty("--color-title-cus");
      root.removeProperty("--primary-cus");
      root.removeProperty("--accent-cus");
      root.removeProperty("--ring-cus");
    }

    if (secondary) {
      root.setProperty("--color-card-bg-cus", secondary);
      root.setProperty("--color-secondary-cus", secondary);
      root.setProperty("--card-cus", secondary);
      root.setProperty("--muted-cus", secondary);
    } else {
      root.removeProperty("--color-card-bg-cus");
      root.removeProperty("--color-secondary-cus");
      root.removeProperty("--card-cus");
      root.removeProperty("--muted-cus");
    }

    if (!primary && !secondary) {
      root.removeProperty("--background-cus");
      root.removeProperty("--border-cus");
    } else {
      root.setProperty("--background-cus", "#ffffff");
      root.setProperty("--border-cus", "#808080");
    }
  };

  const handleUpdate = async () => {
    if (!portfolioId && !customDesignId) {
      setFeedback("Save sections first to attach theme");
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      // Apply to DOM
      const combo = colorCombinations[pendingComboIndex];
      applyColorsToDom(combo);
      setAppliedComboIndex(pendingComboIndex);
      if (pendingFont && typeof window !== "undefined") {
        document.documentElement.style.setProperty("--font-montserrat-cus", pendingFont);
        document.body.style.setProperty("--font-montserrat-cus", pendingFont);
        setAppliedFont(pendingFont);
      }

      const assetsPayload = {
        palette: {
          name: combo.name,
          primary: combo.primary,
          secondary: combo.secondary,
        },
        font: pendingFont,
      };

      // Persist assets -> update or create design (if not existing but we have portfolioId)
      if (customDesignId) {
        await updatePortfolio(customDesignId, { assets: assetsPayload });
      } else if (portfolioId) {
        const created = await createCustomDesign({ portfolioId, assets: assetsPayload });
        if (created?.id) setCustomDesignId(created.id);
      }

      // Cache in sessionStorage for quick hydration in preview without refetch
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("designAssetsDraft", JSON.stringify(assetsPayload));
        }
      } catch {
        /* ignore */
      }

      setFeedback("Theme updated");
      try {
        await refresh();
      } catch {}
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Failed to update theme");
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const openStudio = () => router.push("/studio?mode=edit");

  const handleFontChange = (value: string) => {
    setPendingFont(value);
  };

  return (
    <div className="space-y-10 mx-30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--color-title)" }}>
            Theme / Assets
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-description)" }}>
            Customize your color palette & typography. Changes apply live.
          </p>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 ">
            {feedback && (
              <p className="text-xs max-w-[200px] truncate" style={{ color: "var(--color-description)" }} title={feedback}>
                {feedback}
              </p>
            )}
            <Button onClick={handleUpdate} disabled={isSaving} variant="fill" className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Update"}
            </Button>
            <Button onClick={openStudio} variant="outline" className="gap-2">
              <Edit2 className="w-4 h-4" />
              Studio
            </Button>
          </div>
        </div>
      </div>

      <section>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {colorCombinations.map((combo, idx) => {
            const isPending = pendingComboIndex === idx;
            const isApplied = appliedComboIndex === idx;
            return (
              <button
                key={combo.name}
                onClick={() => setPendingComboIndex(idx)}
                className={`group relative flex rounded-full overflow-hidden shadow-md transition-all duration-200 hover:scale-105 cursor-pointer h-16 ${
                  isPending ? "ring-2 ring-accent/60" : isApplied ? "ring-1 ring-accent/30" : "hover:ring-1 hover:ring-accent/40"
                }`}
                title={`${combo.name} palette`}
                aria-label={`Apply ${combo.name} palette`}
              >
                <div className="w-1/2 h-full" style={{ backgroundColor: combo.primary || "var(--color-accent)" }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: combo.secondary || "var(--color-card-bg)" }} />
                {idx === 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white/90 bg-black/30">
                    Default
                  </span>
                )}
                {isPending && (
                  <span className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/90 shadow">
                    <Check className="w-4 h-4 text-accent" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-description)" }}>
          Fonts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {fontOptions.map((opt) => {
            const isPending = pendingFont === opt.value;
            const isApplied = appliedFont === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => handleFontChange(opt.value)}
                className={`flex items-center justify-center text-xl h-14 rounded-md bg-white transition-all duration-200 hover:scale-105 cursor-pointer ${
                  isPending ? "ring-2 ring-accent" : isApplied ? "ring-1 ring-accent/40" : "border border-transparent"
                }`}
                title={opt.label}
                style={{ fontFamily: opt.value }}
                aria-label={`Select ${opt.label} font`}
              >
                ABC
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-description)" }}>
          Notes
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-description)" }}>
          Color & font choices are now applied only when you click Update. They still aren't persisted server-side yet – adding
          persistence can be implemented later.
        </p>
      </section>
    </div>
  );
}
