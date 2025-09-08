"use client";

import { useStudio } from "@/context/StudioContext";
import { useEffect, useState } from "react";
import { api } from "@/api/auth-endpoints";
import { MonitorSmartphone, Smartphone, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type SectionData = { id: string; type: string; html?: string; data?: any };

export default function DisplayPage() {
  const { used } = useStudio();
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(false);
  const [sectionsData, setSectionsData] = useState<Record<string, SectionData>>({});
  const [error, setError] = useState<string | null>(null);

  // fetch data for used sections (mocked pattern – endpoint TBD)
  //   useEffect(() => {
  //     if (!used.length) return;
  //     let cancelled = false;
  //     (async () => {
  //       setLoading(true);
  //       setError(null);
  //       try {
  //         // Placeholder: assume endpoint /builder/sections?ids=... returns array
  //         const ids = used.map((u) => u.id).join(",");
  //         const { data } = await api.get(`/builder/sections`, { params: { ids } });
  //         if (cancelled) return;
  //         const map: Record<string, SectionData> = {};
  //         (data || []).forEach((d: any) => {
  //           map[d.id] = d;
  //         });
  //         setSectionsData(map);
  //       } catch (e: any) {
  //         if (!cancelled) setError(e?.message || "Failed to load sections");
  //       } finally {
  //         if (!cancelled) setLoading(false);
  //       }
  //     })();
  //     return () => {
  //       cancelled = true;
  //     };
  //   }, [used]);

  const reload = () => {
    // trigger effect by resetting used clone
    setSectionsData({});
    setError(null);
    if (used.length) {
      // re-run by creating a new array reference (context unchanged) – simplest: force state via a dummy set
      // In absence of direct refetch hook, toggle view twice
      setView((v) => (v === "desktop" ? "mobile" : "desktop"));
      setTimeout(() => setView((v) => (v === "desktop" ? "mobile" : "desktop")), 0);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <Button variant={view === "desktop" ? "fill" : "outline"} onClick={() => setView("desktop")}>
          <MonitorSmartphone className="inline w-4 h-4 mr-1" /> Desktop
        </Button>
        <Button variant={view === "mobile" ? "fill" : "outline"} onClick={() => setView("mobile")}>
          <Smartphone className="inline w-4 h-4 mr-1" /> Mobile
        </Button>
        <Button variant="outline" onClick={reload} className="ml-auto ">
          <RefreshCcw className="w-4 h-4" /> Reload
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 border rounded bg-white">
        {loading && <div className="text-sm text-gray-500">Loading sections...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && !used.length && (
          <div className="text-sm text-gray-400 text-center py-10">Add sections from the sidebar to preview them.</div>
        )}
        <div
          className={`mx-auto ${
            view === "desktop" ? "w-full max-w-5xl" : "w-[390px] border shadow-md rounded-lg"
          } transition-all`}
        >
          {used.map((sec) => {
            const secData = sectionsData[sec.id];
            return (
              <div key={sec.id} className="border mb-4 rounded overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 text-xs font-medium flex justify-between">
                  <span>
                    {sec.name} ({view})
                  </span>
                  {!secData && <span className="italic text-gray-400">fetching...</span>}
                </div>
                <div className="p-4 text-sm">
                  {secData?.html ? (
                    <div dangerouslySetInnerHTML={{ __html: secData.html }} />
                  ) : (
                    <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                      {JSON.stringify(secData || { id: sec.id, placeholder: true }, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
