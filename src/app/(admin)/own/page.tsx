"use client";

import { useEffect, useState } from "react";
import { getCustomDesignById } from "@/api/studio-endpoints";
import { sectionsRegistry } from "@/components/pages/sections-design/registry/sections-registry";
import { useStudio } from "@/context/StudioContext";

type SectionItem = { type: string; config: unknown };

function safeGetSessionItem(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function SectionRenderer({ sec, idx }: { sec: SectionItem; idx: number }) {
  const def = sectionsRegistry[sec.type as keyof typeof sectionsRegistry];
  if (!def)
    return (
      <div key={idx} className="border mb-4 rounded p-4 bg-red-50 text-sm text-red-600">
        Unknown section type: {sec.type}
      </div>
    );
  const Design = def.Design;
  return (
    <div key={idx} className="my-10">
      <Design config={sec.config} view="desktop" />
    </div>
  );
}

export default function Own() {
  const { customDesignId } = useStudio();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchSections() {
      setLoading(true);
      setError(null);
      try {
        const idFromContext = customDesignId || safeGetSessionItem("customDesignId");
        if (!idFromContext) throw new Error("No published design id found.");
        const data = await getCustomDesignById(idFromContext);
        const payload = Array.isArray(data?.sections) ? data!.sections : [];
        if (mounted) setSections(payload);
      } catch (e: unknown) {
        if (!mounted) return;
        if (e instanceof Error) setError(e.message);
        else if (typeof e === "object" && e !== null && "message" in e) {
          const msg = (e as { message?: unknown }).message;
          setError(typeof msg === "string" ? msg : "Failed to load portfolio");
        } else {
          setError("Failed to load portfolio");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSections();
    return () => {
      mounted = false;
    };
  }, [customDesignId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Portfolio</h1>
      {!sections.length && <p>No sections published yet.</p>}
      <div>
        {sections.map((sec, idx) => (
          <SectionRenderer key={idx} sec={sec} idx={idx} />
        ))}
      </div>
    </div>
  );
}
