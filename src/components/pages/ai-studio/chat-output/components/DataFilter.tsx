"use client";

// Extract content from tagged text [TAG]content[/TAG] or strip tags
const cleanTaggedText = (text: string): string => {
  if (!text) return "";

  // Try extracting from common tags in order
  for (const tag of ["P", "H", "T", "O"]) {
    const regex = new RegExp(`\\[${tag}\\](.*?)\\[/${tag}\\]`, "s");
    const match = text.match(regex);
    if (match) return match[1].trim();
  }

  // If no tags found, strip any remaining tag markers
  return text.replace(/\[[^\]]+\]/g, "").trim();
};

// Clean text by extracting from tags or returning as-is
const cleanText = (value: any): any => {
  if (typeof value === "string") {
    return cleanTaggedText(value);
  }
  if (Array.isArray(value)) return value.map(cleanText);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cleanText(v)]));
  }
  return value;
};

// Filter and clean the AI analysis data
export const filterAiAnalysisData = (data: any) => {
  const analysis = data?.aiAnalysis || data;
  if (!analysis || typeof analysis !== "object") return null;
  return cleanText(analysis);
};

// Extract project details from specific keys
export const filterProjectDetails = (data: any) => {
  if (!data) return null;

  const detailKeys = [
    "a1_corevalue",
    "a2_mainuser",
    "a3_magicaction",
    "b1_musthavefeaturesmvp",
    "b2_useraccountdata",
    "b3_payments",
    "b4_content",
    "c1_visualexamples",
    "c2_startingscale",
    "c3_futurevision",
    "d1_yourinvolvement",
    "d2_initialbudgetrange",
    "d3_timeline",
  ];

  return Object.fromEntries(
    detailKeys.map((key) => [key, cleanText(data[key])]).filter(([, value]) => value?.trim?.() || typeof value === "object"),
  );
};
