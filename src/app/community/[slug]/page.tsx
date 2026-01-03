import CommunityMedia from "@/components/pages/community/CommunityMedia";

export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <CommunityMedia slug={slug} />;
}
