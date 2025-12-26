"use client";

import Preview from "@/components/pages/dashboard/PreviewDashboard";
import InsightsDashboard from "@/components/pages/dashboard/control/InsightsControl";

export interface ControlDashboardProps {
  panel?: string;
}

export default function ControlDashboard({ panel }: ControlDashboardProps) {
  return (
    <div className="h-full overflow-auto">
      {panel === "preview" && <Preview />}
      {panel === "insights" && <InsightsDashboard />}

      {!panel && (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Welcome to your dashboard</h1>
          <p className="text-sm text-description">Select an item from the sidebar to view details.</p>
        </div>
      )}
    </div>
  );
}
