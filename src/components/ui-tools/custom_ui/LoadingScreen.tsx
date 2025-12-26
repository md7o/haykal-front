import { Spinner } from "@/components/ui-tools/ui/spinner";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-black/50">
      <Spinner className="mx-auto text-white size-10" />
      <span className="text-white">Loading...</span>
    </div>
  );
}
