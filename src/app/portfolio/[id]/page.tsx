import PortfView from "@/components/pages/portfolio-feature/layout/PortfView";

export default async function PortfViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortfView idOrSlug={id} />;
}
