import { createServerClient } from "./supabase-server";
import type { Category, Product, Sale } from "./database.types";
import { mapCategory, mapProduct, mapSale } from "./database.types";

export type { Category, Product, Sale };

export type CategoryWithCount = Category & { productCount: number };
export type ProductWithCategory = Product & { category: Category | null };
export type SaleWithProduct = Sale & {
  product: (Product & { category: Category | null }) | null;
};

function supabase() {
  return createServerClient();
}

// ─── Category ────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryWithCount[]> {
  const db = supabase();
  const { data: categories, error } = await db
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const { data: counts } = await db
    .from("products")
    .select("category_id");

  const countMap = new Map<string, number>();
  (counts ?? []).forEach((p: any) => {
    countMap.set(p.category_id, (countMap.get(p.category_id) ?? 0) + 1);
  });

  return (categories ?? []).map((c: any) => ({
    ...mapCategory(c),
    productCount: countMap.get(c.id) ?? 0,
  }));
}

export async function createCategory(name: string, description: string, color: string) {
  const { data, error } = await supabase()
    .from("categories")
    .insert({ name, description, color })
    .select()
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function updateCategory(id: string, updates: { name?: string; description?: string; color?: string }) {
  const { data, error } = await supabase()
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapCategory(data);
}

export async function deleteCategory(id: string) {
  const { error } = await supabase().from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ─── Product ─────────────────────────────────────────────────

export async function getProducts(): Promise<ProductWithCategory[]> {
  const { data, error } = await supabase()
    .from("products")
    .select("*, categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...mapProduct(row),
    category: row.categories ? mapCategory(row.categories) : null,
  }));
}

export async function createProduct(input: {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  sku?: string;
  imageUrl?: string;
  status?: string;
  categoryId: string;
}) {
  const { data, error } = await supabase()
    .from("products")
    .insert({
      name: input.name,
      description: input.description,
      price: input.price,
      cost: input.cost,
      stock: input.stock,
      min_stock: input.minStock,
      sku: input.sku,
      image_url: input.imageUrl,
      status: input.status,
      category_id: input.categoryId,
    })
    .select()
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function updateProduct(id: string, updates: {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  sku?: string;
  imageUrl?: string;
  status?: string;
  categoryId?: string;
}) {
  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
  if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
  if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
  if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
  if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;

  const { data, error } = await supabase()
    .from("products")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapProduct(data);
}

export async function deleteProduct(id: string) {
  const { error } = await supabase().from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkDeleteProducts(ids: string[]) {
  const { error } = await supabase().from("products").delete().in("id", ids);
  if (error) throw error;
}

export async function bulkUpdateStatus(ids: string[], status: string) {
  const { error } = await supabase()
    .from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw error;
}

// ─── Sale ────────────────────────────────────────────────────

export async function getSales(): Promise<SaleWithProduct[]> {
  const { data, error } = await supabase()
    .from("sales")
    .select("*, products(*, categories(*))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...mapSale(row),
    product: row.products
      ? {
          ...mapProduct(row.products),
          category: row.products.categories ? mapCategory(row.products.categories) : null,
        }
      : null,
  }));
}

export async function createSale(input: {
  productId: string;
  quantity: number;
  customer?: string;
  note?: string;
}) {
  const db = supabase();

  const { data: product, error: pErr } = await db
    .from("products")
    .select("*")
    .eq("id", input.productId)
    .single();
  if (pErr || !product) throw pErr ?? new Error("Product not found");

  if (product.stock < input.quantity) {
    throw new Error("Not enough stock. Available: " + product.stock);
  }

  const unitPrice = product.price;
  const total = unitPrice * input.quantity;
  const profit = (unitPrice - product.cost) * input.quantity;

  const { data: sale, error: sErr } = await db
    .from("sales")
    .insert({
      product_id: input.productId,
      quantity: input.quantity,
      unit_price: unitPrice,
      total,
      profit,
      customer: input.customer ?? "",
      note: input.note ?? "",
    })
    .select()
    .single();
  if (sErr) throw sErr;

  const { error: uErr } = await db
    .from("products")
    .update({ stock: product.stock - input.quantity })
    .eq("id", input.productId);
  if (uErr) throw uErr;

  return mapSale(sale);
}

export async function deleteSale(id: string) {
  const db = supabase();

  const { data: sale, error: sErr } = await db
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();
  if (sErr || !sale) throw sErr ?? new Error("Sale not found");

  const { data: product } = await db
    .from("products")
    .select("stock")
    .eq("id", sale.product_id)
    .single();

  const { error: dErr } = await db.from("sales").delete().eq("id", id);
  if (dErr) throw dErr;

  if (product) {
    await db
      .from("products")
      .update({ stock: product.stock + sale.quantity })
      .eq("id", sale.product_id);
  }
}

// ─── Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats() {
  const db = supabase();

  const [productsRes, categoriesRes, salesRes] = await Promise.all([
    db.from("products").select("*, categories(*)"),
    db.from("categories").select("*"),
    db.from("sales").select("*, products(name)"),
  ]);

  const allProducts = (productsRes.data ?? []).map((row: any) => ({
    ...mapProduct(row),
    category: row.categories ? mapCategory(row.categories) : null,
  })) as ProductWithCategory[];

  const allCategories = (categoriesRes.data ?? []).map((c: any) => mapCategory(c));
  const allSales = (salesRes.data ?? []).map((row: any) => ({
    ...mapSale(row),
    product: row.products ? { name: row.products.name } : null,
  }));

  const lowStockProducts = allProducts
    .filter((p) => p.stock <= 5 && p.status === "active")
    .sort((a, b) => a.stock - b.stock);

  const totalSales = allSales.length;
  const revenue = allSales.reduce((s, x) => s + (x.total ?? 0), 0);
  const profit = allSales.reduce((s, x) => s + (x.profit ?? 0), 0);

  const recentSales = [...allSales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const salesByProduct = new Map<string, { quantity: number; total: number }>();
  for (const s of allSales) {
    const existing = salesByProduct.get(s.productId) ?? { quantity: 0, total: 0 };
    existing.quantity += s.quantity;
    existing.total += s.total;
    salesByProduct.set(s.productId, existing);
  }

  const topProducts = [...salesByProduct.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([productId, sums]) => ({
      productId,
      _sum: sums,
      product: allProducts.find((p) => p.id === productId),
    }));

  return {
    totalProducts: allProducts.length,
    totalCategories: allCategories.length,
    totalSales,
    revenue,
    profit,
    lowStockProducts,
    recentSales,
    topProducts,
  };
}
