import StudioPage from "@/components/pages/portfolio-feature/layout/StudioPage";

export default async function Studio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudioPage id={id} />;
}
