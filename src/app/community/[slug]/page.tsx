import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const { slug } = (await params) as { slug: string };
  redirect(`/community/${slug}/feed`);
}
