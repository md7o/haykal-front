"use client";

import { useEffect, useState } from "react";
import { getAiIdeaById, ideaType } from "@/api/ai-api/idea-endpoints";
import { filterAiAnalysisData, filterProjectDetails } from "./components/DataFilter";
import { LoadingState, ErrorState, EmptyState, NoAnalysisState, ProjectDetails } from "./components/components";
import BusinessBrief from "./components/BusinessBrief";

const parseAnswersData = (data: any) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      console.error("Failed to parse answersData");
      return null;
    }
  }
  return data;
};

export default function ResponseAi({ id }: { id: string }) {
  const [idea, setIdea] = useState<ideaType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setIdea(await getAiIdeaById(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch idea");
        setIdea(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!idea) return <EmptyState />;

  const parsedData = parseAnswersData(idea.answersData);
  const filteredAnalysis = filterAiAnalysisData(parsedData);
  const projectDetails = filterProjectDetails(parsedData);

  return (
    <div className="">
      {/* Header */}
      <header className="sticky top-0 bg-card-bg  z-10">
        <div className="max-w-5xl mx-auto py-6">
          <h1 className="text-3xl font-bold text-title mb-2">{idea.projectName}</h1>
          <div className="flex gap-6 text-sm text-description">
            <time dateTime={idea.createdAt}>📅 Created: {new Date(idea.createdAt).toLocaleDateString()}</time>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-8">
        {filteredAnalysis ? <BusinessBrief data={filteredAnalysis} /> : <NoAnalysisState />}
        {projectDetails && <ProjectDetails details={projectDetails} />}
      </main>
    </div>
  );
}
