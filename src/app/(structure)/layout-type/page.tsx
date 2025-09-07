import LayoutPage from "@/components/pages/structure/LayoutPage";
import { Progress } from "@/components/ui/progress";

export default function LayoutType() {
  return (
    <>
      <Progress className="md:w-[33%] w-[80%] mx-auto flex justify-center my-5" value={50} />
      <LayoutPage />
    </>
  );
}
