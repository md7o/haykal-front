import CategoryPage from "@/components/pages/structure/CategoryPage";
import { Progress } from "@/components/ui/progress";

export default function CategoryType() {
  return (
    <>
      <Progress className="md:w-[33%] w-[80%] mx-auto flex justify-center my-5" value={33} />
      <CategoryPage />
    </>
  );
}
