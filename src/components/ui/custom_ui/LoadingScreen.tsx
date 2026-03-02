import { Spinner } from "@/components/ui/shadcn_ui/spinner";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-black/60 backdrop-blur-xs">
      <Spinner className="mx-auto text-white size-10" />
      <span className="text-white">Loading...</span>
    </div>
  );
}
