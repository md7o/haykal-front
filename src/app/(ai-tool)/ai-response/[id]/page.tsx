import ResponseAi from "@/components/pages/ai-studio/responses/ResponseAi";
import AiLayout from "@/components/pages/ai-studio/shared/LayoutAi";

export default async function ResponsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AiLayout>
      <ResponseAi id={id} />
    </AiLayout>
  );
}
