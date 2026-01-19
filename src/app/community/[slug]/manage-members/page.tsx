"use client";

import { use } from "react";

import ManageMembersContent from "@/components/pages/community/ManageMembersContent";

interface ManageMembersPageProps {
  params: Promise<{ slug: string }>;
}

export default function ManageMembersPage({ params }: ManageMembersPageProps) {
  const { slug } = use(params);

  return <ManageMembersContent slug={slug} />;
}
