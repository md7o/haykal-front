import { useMemo, useState } from "react";

export interface Searchable {
  id: string;
  title: string;
  content?: string;
  [key: string]: any;
}

interface UseSearchOptions {
  searchableFields?: string[];
}

export function useSearch<T extends Searchable>(items: T[], options?: UseSearchOptions) {
  const [query, setQuery] = useState("");

  const searchableFields = options?.searchableFields || ["title", "content"];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      const haystack = searchableFields
        .map((field) => {
          const value = item[field];
          return typeof value === "string" ? value : "";
        })
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, query, searchableFields]);

  return {
    query,
    setQuery,
    results,
    hasResults: results.length > 0,
  };
}
