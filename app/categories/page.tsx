import { getCategories } from "@/app/lib/db";
import CategoryList from "./category-list";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <CategoryList categories={categories} />
    </div>
  );
}
