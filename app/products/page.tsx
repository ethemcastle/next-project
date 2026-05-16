import { getProducts, getCategories } from "@/app/lib/db";
import { ProductsProvider } from "./context";
import ProductList from "./product-list";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <ProductsProvider products={products} categories={categories}>
        <ProductList />
      </ProductsProvider>
    </div>
  );
}
