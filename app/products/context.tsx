"use client";

import { createContext, useContext } from "react";
import type { CategoryWithCount, ProductWithCategory } from "@/app/lib/db";

type ProductsContextType = {
  products: ProductWithCategory[];
  categories: CategoryWithCount[];
};

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({
  children,
  products,
  categories,
}: {
  children: React.ReactNode;
  products: ProductWithCategory[];
  categories: CategoryWithCount[];
}) {
  return (
    <ProductsContext.Provider value={{ products, categories }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
