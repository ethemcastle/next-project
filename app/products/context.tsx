"use client";

import { createContext, useContext } from "react";

type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  _count: { products: number };
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  sku: string;
  imageUrl: string;
  status: string;
  categoryId: string;
  category: { id: string; name: string; color: string };
  _count: { sales: number };
  createdAt: Date;
  updatedAt: Date;
};

type ProductsContextType = {
  products: Product[];
  categories: Category[];
};

const ProductsContext = createContext<ProductsContextType | null>(null);

export type { Product, Category };

export function ProductsProvider({
  children,
  products,
  categories,
}: {
  children: React.ReactNode;
  products: Product[];
  categories: Category[];
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
