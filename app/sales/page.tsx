import { getSales, getProducts } from "@/app/lib/db";
import SaleList from "./sale-list";

export default async function SalesPage() {
  const [sales, products] = await Promise.all([getSales(), getProducts()]);

  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <SaleList sales={sales} products={products} />
    </div>
  );
}
