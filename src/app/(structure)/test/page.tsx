"use client";

import { getSections, type Section } from "@/api/portfolios-api/sections-endpoints";
import { useEffect, useState } from "react";
import { sectionsVisualization } from "@/components/pages/portfolio-feature/sections-design/sectionsVisualization";

export default function Test() {
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    // fetch portfolio data from portfolio API

    getSections("8a276b1c-d261-4330-b7e1-b192f7039e41").then((data) => {
      console.log("Sections:", data);
      setSections(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Sections Preview</h1>
      <div className="space-y-8">
        {sections.map((section) => {
          const definition = sectionsVisualization[section.type];

          if (!definition) {
            return (
              <div key={section.id} className="p-4 border border-red-200 bg-red-50 rounded text-red-600">
                Unknown section type: {section.type}
              </div>
            );
          }

          const { Design } = definition;
          return (
            <div key={section.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <Design config={section.config} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
