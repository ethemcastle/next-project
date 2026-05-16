import os

base = os.path.dirname(os.path.abspath(__file__))

files = {}

# ─── Modal ────────────────────────────────────────────────────
files["app/components/modal.tsx"] = '''"use client";

import { useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          &#10005;
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
'''

# ─── Stat Card ────────────────────────────────────────────────
files["app/components/stat-card.tsx"] = '''export function StatCard({
  label,
  value,
  sub,
  color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "green" | "purple" | "red" | "yellow";
}) {
  const colors = {
    blue: "border-blue-500 bg-blue-50 dark:bg-blue-950",
    green: "border-green-500 bg-green-50 dark:bg-green-950",
    purple: "border-purple-500 bg-purple-50 dark:bg-purple-950",
    red: "border-red-500 bg-red-50 dark:bg-red-950",
    yellow: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  };

  return (
    <div className={`rounded-xl border-l-4 p-4 ${colors[color]}`}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}
'''

# ─── Badge ────────────────────────────────────────────────────
files["app/components/badge.tsx"] = '''export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const styles = {
    default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
'''

# ─── Categories Actions (updated) ────────────────────────────
files["app/categories/actions.ts"] = '''"use server";

import { revalidatePath } from "next/cache";
import { createCategory, updateCategory, deleteCategory } from "@/app/lib/db";

export async function createCategoryAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;
  if (!name?.trim()) return;
  await createCategory(name.trim(), description?.trim() ?? "", color || "#3b82f6");
  revalidatePath("/categories");
}

export async function updateCategoryAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;
  if (!id || !name?.trim()) return;
  await updateCategory(id, { name: name.trim(), description: description?.trim(), color });
  revalidatePath("/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteCategory(id);
  revalidatePath("/categories");
}
'''

# ─── Categories Page ──────────────────────────────────────────
files["app/categories/page.tsx"] = '''import { getCategories } from "@/app/lib/db";
import CategoryList from "./category-list";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <CategoryList categories={categories} />
    </div>
  );
}
'''

# ─── Categories List (enhanced) ──────────────────────────────
files["app/categories/category-list.tsx"] = '''"use client";

import { useState } from "react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";
import { Modal } from "@/app/components/modal";

type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  _count: { products: number };
};

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Category
        </button>
      </div>

      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800"
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Category">
        <form
          action={async (formData) => {
            await createCategoryAction(formData);
            setShowCreate(false);
          }}
          className="space-y-4"
        >
          <input name="name" placeholder="Category name" required className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
          <textarea name="description" placeholder="Description (optional)" rows={3} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
          <div className="flex items-center gap-3">
            <label className="text-sm">Color</label>
            <input name="color" type="color" defaultValue="#3b82f6" className="h-10 w-14 rounded border-0 p-0" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
            Create Category
          </button>
        </form>
      </Modal>

      {filtered.length === 0 ? (
        <p className="text-center text-zinc-500 py-8">
          {search ? "No categories match your search." : "No categories yet. Create one!"}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
              style={{ borderLeftColor: cat.color, borderLeftWidth: 4 }}
            >
              {editingId === cat.id ? (
                <form
                  action={async (fd) => {
                    await updateCategoryAction(fd);
                    setEditingId(null);
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="id" value={cat.id} />
                  <input name="name" defaultValue={cat.name} required className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
                  <textarea name="description" defaultValue={cat.description} rows={2} className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
                  <input name="color" type="color" defaultValue={cat.color} className="h-8 w-12 rounded border-0 p-0" />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded bg-green-600 px-3 py-1 text-sm text-white">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded bg-zinc-500 px-3 py-1 text-sm text-white">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-sm text-zinc-500 mt-1">{cat.description}</p>
                      )}
                    </div>
                    <span
                      className="inline-block h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-500">
                      {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(cat.id)} className="text-sm text-yellow-600 hover:underline">
                        Edit
                      </button>
                      <form action={deleteCategoryAction}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button type="submit" className="text-sm text-red-600 hover:underline">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'''

# ─── Products Actions (updated) ──────────────────────────────
files["app/products/actions.ts"] = '''"use server";

import { revalidatePath } from "next/cache";
import { createProduct, updateProduct, deleteProduct, bulkDeleteProducts, bulkUpdateStatus } from "@/app/lib/db";

export async function createProductAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const stock = parseInt(formData.get("stock") as string, 10);
  const minStock = parseInt(formData.get("minStock") as string, 10) || 5;
  const sku = formData.get("sku") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!name?.trim() || isNaN(price) || isNaN(stock) || !categoryId) return;

  await createProduct({
    name: name.trim(),
    description: description?.trim(),
    price,
    cost,
    stock,
    minStock,
    sku: sku?.trim(),
    imageUrl: imageUrl?.trim(),
    categoryId,
  });
  revalidatePath("/products");
}

export async function updateProductAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const cost = parseFloat(formData.get("cost") as string) || 0;
  const stock = parseInt(formData.get("stock") as string, 10);
  const minStock = parseInt(formData.get("minStock") as string, 10) || 5;
  const sku = formData.get("sku") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const status = formData.get("status") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!id || !name?.trim() || isNaN(price) || isNaN(stock) || !categoryId) return;

  await updateProduct(id, {
    name: name.trim(),
    description: description?.trim(),
    price,
    cost,
    stock,
    minStock,
    sku: sku?.trim(),
    imageUrl: imageUrl?.trim(),
    status,
    categoryId,
  });
  revalidatePath("/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/products");
}

export async function bulkDeleteAction(formData: FormData) {
  const ids = JSON.parse(formData.get("ids") as string) as string[];
  if (!ids?.length) return;
  await bulkDeleteProducts(ids);
  revalidatePath("/products");
}

export async function bulkStatusAction(formData: FormData) {
  const ids = JSON.parse(formData.get("ids") as string) as string[];
  const status = formData.get("status") as string;
  if (!ids?.length || !status) return;
  await bulkUpdateStatus(ids, status);
  revalidatePath("/products");
}
'''

# ─── Products Context (updated) ──────────────────────────────
files["app/products/context.tsx"] = '''"use client";

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
'''

# ─── Products Page (updated) ─────────────────────────────────
files["app/products/page.tsx"] = '''import { getProducts, getCategories } from "@/app/lib/db";
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
'''

# ─── Product List (complete rewrite) ─────────────────────────
files["app/products/product-list.tsx"] = '''"use client";

import { useState, useMemo } from "react";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  bulkDeleteAction,
  bulkStatusAction,
} from "./actions";
import { useProducts } from "./context";
import type { Product } from "./context";
import { Modal } from "@/app/components/modal";
import { Badge } from "@/app/components/badge";

type SortKey = "name" | "price" | "stock" | "createdAt" | "status";
type SortDir = "asc" | "desc";

export default function ProductList() {
  const { products, categories } = useProducts();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    let list = [...products];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    if (filterCategory) list = list.filter((p) => p.categoryId === filterCategory);
    if (filterStatus) list = list.filter((p) => p.status === filterStatus);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "stock") cmp = a.stock - b.stock;
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [products, search, filterCategory, filterStatus, sortKey, sortDir]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const statusBadge = (status: string) => {
    if (status === "active") return <Badge variant="success">Active</Badge>;
    if (status === "draft") return <Badge variant="warning">Draft</Badge>;
    return <Badge variant="danger">Archived</Badge>;
  };

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <Badge variant="danger">Out of stock</Badge>;
    if (p.stock <= p.minStock) return <Badge variant="warning">Low stock</Badge>;
    return <Badge variant="success">{p.stock} in stock</Badge>;
  };

  const margin = (p: Product) => {
    if (p.cost === 0) return null;
    const pct = ((p.price - p.cost) / p.price) * 100;
    return `${pct.toFixed(0)}% margin`;
  };

  const inputCls = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800";

  const formFields = (defaults?: Product) => (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Name *</label>
          <input name="name" defaultValue={defaults?.name} required className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-500">Description</label>
          <textarea name="description" defaultValue={defaults?.description} rows={2} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Price *</label>
          <input name="price" type="number" step="0.01" defaultValue={defaults?.price} required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Cost</label>
          <input name="cost" type="number" step="0.01" defaultValue={defaults?.cost ?? 0} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Stock *</label>
          <input name="stock" type="number" defaultValue={defaults?.stock ?? 0} required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Min Stock Alert</label>
          <input name="minStock" type="number" defaultValue={defaults?.minStock ?? 5} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">SKU</label>
          <input name="sku" defaultValue={defaults?.sku} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Image URL</label>
          <input name="imageUrl" defaultValue={defaults?.imageUrl} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-500">Category *</label>
          <select name="categoryId" defaultValue={defaults?.categoryId} required className={inputCls}>
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {defaults && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Status</label>
            <select name="status" defaultValue={defaults.status} className={inputCls}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-zinc-500">{products.length} total, {filtered.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          >
            {viewMode === "grid" ? "Table" : "Grid"} View
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={`${sortKey}-${sortDir}`}
          onChange={(e) => {
            const [k, d] = e.target.value.split("-") as [SortKey, SortDir];
            setSortKey(k);
            setSortDir(d);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        >
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Price Low-High</option>
          <option value="price-desc">Price High-Low</option>
          <option value="stock-asc">Stock Low-High</option>
          <option value="stock-desc">Stock High-Low</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm dark:bg-blue-950">
          <span className="font-medium">{selected.size} selected</span>
          <form action={bulkStatusAction}>
            <input type="hidden" name="ids" value={JSON.stringify([...selected])} />
            <input type="hidden" name="status" value="active" />
            <button type="submit" className="text-green-600 hover:underline">Activate</button>
          </form>
          <form action={bulkStatusAction}>
            <input type="hidden" name="ids" value={JSON.stringify([...selected])} />
            <input type="hidden" name="status" value="archived" />
            <button type="submit" className="text-yellow-600 hover:underline">Archive</button>
          </form>
          <form action={bulkDeleteAction} onSubmit={(e) => { if (!confirm("Delete selected products?")) e.preventDefault(); }}>
            <input type="hidden" name="ids" value={JSON.stringify([...selected])} />
            <button type="submit" className="text-red-600 hover:underline">Delete</button>
          </form>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-zinc-500 hover:underline">Clear</button>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Product">
        <form
          action={async (fd) => {
            await createProductAction(fd);
            setShowCreate(false);
          }}
          className="space-y-4"
        >
          {formFields()}
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">
            Create Product
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product">
        {editingProduct && (
          <form
            action={async (fd) => {
              await updateProductAction(fd);
              setEditingProduct(null);
            }}
            className="space-y-4"
          >
            <input type="hidden" name="id" value={editingProduct.id} />
            {formFields(editingProduct)}
            <button type="submit" className="w-full rounded-lg bg-green-600 py-2 text-white hover:bg-green-700">
              Save Changes
            </button>
          </form>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailProduct} onClose={() => setDetailProduct(null)} title="Product Details">
        {detailProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-zinc-500">Name:</span> {detailProduct.name}</div>
              <div><span className="text-zinc-500">SKU:</span> {detailProduct.sku || "—"}</div>
              <div><span className="text-zinc-500">Price:</span> ${detailProduct.price.toFixed(2)}</div>
              <div><span className="text-zinc-500">Cost:</span> ${detailProduct.cost.toFixed(2)}</div>
              <div><span className="text-zinc-500">Stock:</span> {detailProduct.stock}</div>
              <div><span className="text-zinc-500">Min Stock:</span> {detailProduct.minStock}</div>
              <div><span className="text-zinc-500">Category:</span> {detailProduct.category.name}</div>
              <div><span className="text-zinc-500">Status:</span> {statusBadge(detailProduct.status)}</div>
              <div><span className="text-zinc-500">Sales:</span> {detailProduct._count.sales}</div>
              <div><span className="text-zinc-500">Margin:</span> {margin(detailProduct) || "—"}</div>
            </div>
            {detailProduct.description && (
              <div className="text-sm">
                <span className="text-zinc-500">Description:</span>
                <p className="mt-1">{detailProduct.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Product List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-500">No products found</p>
          <p className="text-sm text-zinc-400 mt-1">Try adjusting your filters or create a new product</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`group relative rounded-xl border p-4 transition-shadow hover:shadow-md ${
                selected.has(p.id) ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30" : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleSelect(p.id)}
                className="absolute left-3 top-3"
              />
              <div className="ml-6">
                <div className="flex items-start justify-between">
                  <button onClick={() => setDetailProduct(p)} className="text-left">
                    <h3 className="font-semibold hover:text-blue-600">{p.name}</h3>
                  </button>
                  {statusBadge(p.status)}
                </div>
                <p className="mt-1 text-xs text-zinc-500" style={{ color: p.category.color }}>
                  {p.category.name}
                </p>
                {p.sku && <p className="text-xs text-zinc-400">SKU: {p.sku}</p>}
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold">${p.price.toFixed(2)}</p>
                    {margin(p) && <p className="text-xs text-zinc-400">{margin(p)}</p>}
                  </div>
                  {stockBadge(p)}
                </div>
                <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditingProduct(p)} className="text-xs text-yellow-600 hover:underline">Edit</button>
                  <form action={deleteProductAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-xs text-red-600 hover:underline">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="p-3 text-left">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                </th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Sales</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filtered.map((p) => (
                <tr key={p.id} className={selected.has(p.id) ? "bg-blue-50/50 dark:bg-blue-950/30" : ""}>
                  <td className="p-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td className="p-3">
                    <button onClick={() => setDetailProduct(p)} className="text-left hover:text-blue-600">
                      <p className="font-medium">{p.name}</p>
                      {p.sku && <p className="text-xs text-zinc-400">SKU: {p.sku}</p>}
                    </button>
                  </td>
                  <td className="p-3" style={{ color: p.category.color }}>{p.category.name}</td>
                  <td className="p-3 text-right font-medium">${p.price.toFixed(2)}</td>
                  <td className="p-3 text-right">{stockBadge(p)}</td>
                  <td className="p-3 text-center">{statusBadge(p.status)}</td>
                  <td className="p-3 text-center">{p._count.sales}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingProduct(p)} className="text-yellow-600 hover:underline">Edit</button>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-red-600 hover:underline">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
'''

# ─── Sales Actions (updated) ─────────────────────────────────
files["app/sales/actions.ts"] = '''"use server";

import { revalidatePath } from "next/cache";
import { createSale, deleteSale } from "@/app/lib/db";

export async function createSaleAction(formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);
  const customer = formData.get("customer") as string;
  const note = formData.get("note") as string;

  if (!productId || isNaN(quantity) || quantity <= 0) return;

  await createSale({
    productId,
    quantity,
    customer: customer?.trim(),
    note: note?.trim(),
  });
  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function deleteSaleAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteSale(id);
  revalidatePath("/sales");
  revalidatePath("/products");
  revalidatePath("/");
}
'''

# ─── Sales Page (updated) ────────────────────────────────────
files["app/sales/page.tsx"] = '''import { getSales, getProducts } from "@/app/lib/db";
import SaleList from "./sale-list";

export default async function SalesPage() {
  const [sales, products] = await Promise.all([getSales(), getProducts()]);

  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <SaleList sales={sales} products={products} />
    </div>
  );
}
'''

# ─── Sales List (enhanced) ───────────────────────────────────
files["app/sales/sale-list.tsx"] = '''"use client";

import { useState, useMemo } from "react";
import { createSaleAction, deleteSaleAction } from "./actions";
import { Modal } from "@/app/components/modal";
import { StatCard } from "@/app/components/stat-card";

type Product = {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  categoryId: string;
  category: { id: string; name: string; color: string };
  createdAt: Date;
};

type Sale = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  profit: number;
  customer: string;
  note: string;
  createdAt: Date;
  product: Product;
};

export default function SaleList({
  sales,
  products,
}: {
  sales: Sale[];
  products: Product[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("");

  const filtered = useMemo(() => {
    let list = [...sales];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.product.name.toLowerCase().includes(q) ||
          s.customer.toLowerCase().includes(q) ||
          s.note.toLowerCase().includes(q)
      );
    }
    if (filterProduct) list = list.filter((s) => s.productId === filterProduct);
    return list;
  }, [sales, search, filterProduct]);

  const totalRevenue = filtered.reduce((s, x) => s + x.total, 0);
  const totalProfit = filtered.reduce((s, x) => s + x.profit, 0);
  const totalUnits = filtered.reduce((s, x) => s + x.quantity, 0);

  const inputCls = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800";

  const activeProducts = products.filter((p) => p.stock > 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Record Sale
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Sales" value={filtered.length} color="blue" />
        <StatCard label="Units Sold" value={totalUnits} color="purple" />
        <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} color="green" />
        <StatCard label="Profit" value={`$${totalProfit.toFixed(2)}`} sub={totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : undefined} color="yellow" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search product, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Create Sale Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Record a Sale">
        <form
          action={async (fd) => {
            await createSaleAction(fd);
            setShowCreate(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Product *</label>
            <select name="productId" required className={inputCls}>
              <option value="">Select product</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${p.price.toFixed(2)} ({p.stock} in stock)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Quantity *</label>
            <input name="quantity" type="number" min="1" required className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Customer</label>
            <input name="customer" placeholder="Customer name (optional)" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Note</label>
            <textarea name="note" placeholder="Note (optional)" rows={2} className={inputCls} />
          </div>
          <button type="submit" className="w-full rounded-lg bg-green-600 py-2 text-white hover:bg-green-700">
            Record Sale
          </button>
        </form>
      </Modal>

      {/* Sales Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-500">No sales recorded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Profit</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3">
                    <p className="font-medium">{sale.product.name}</p>
                    <p className="text-xs" style={{ color: sale.product.category.color }}>{sale.product.category.name}</p>
                  </td>
                  <td className="p-3 text-zinc-500">{sale.customer || "—"}</td>
                  <td className="p-3 text-right">{sale.quantity}</td>
                  <td className="p-3 text-right">${sale.unitPrice.toFixed(2)}</td>
                  <td className="p-3 text-right font-medium">${sale.total.toFixed(2)}</td>
                  <td className="p-3 text-right text-green-600">${sale.profit.toFixed(2)}</td>
                  <td className="p-3 text-zinc-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <form action={deleteSaleAction}>
                      <input type="hidden" name="id" value={sale.id} />
                      <button type="submit" className="text-red-600 hover:underline">Refund</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
'''

# ─── Dashboard Home Page ─────────────────────────────────────
files["app/page.tsx"] = '''import Link from "next/link";
import { getDashboardStats } from "@/app/lib/db";
import { StatCard } from "@/app/components/stat-card";

export default async function Page() {
  const stats = await getDashboardStats();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 py-12">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Overview of your product sales</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Products" value={stats.totalProducts} color="blue" />
        <StatCard label="Categories" value={stats.totalCategories} color="purple" />
        <StatCard label="Total Sales" value={stats.totalSales} color="green" />
        <StatCard
          label="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          color="green"
        />
        <StatCard
          label="Profit"
          value={`$${stats.profit.toFixed(2)}`}
          sub={stats.revenue > 0 ? `${((stats.profit / stats.revenue) * 100).toFixed(1)}% margin` : undefined}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">
            Low Stock Alerts
            {stats.lowStockProducts.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-700">
                {stats.lowStockProducts.length}
              </span>
            )}
          </h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-zinc-400">{p.category.name}</span>
                  </div>
                  <span className={`font-mono font-bold ${p.stock === 0 ? "text-red-600" : "text-yellow-600"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Sales */}
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
          {stats.recentSales.length === 0 ? (
            <p className="text-sm text-zinc-500">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{s.product.name}</span>
                    <span className="ml-2 text-xs text-zinc-400">x{s.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-green-600">${s.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Top Products by Revenue</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((t, i) => {
                const maxRevenue = stats.topProducts[0]?._sum?.total || 1;
                const pct = ((t._sum?.total || 0) / maxRevenue) * 100;
                return (
                  <div key={t.productId}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>
                        <span className="font-medium mr-2">#{i + 1}</span>
                        {t.product?.name}
                        <span className="ml-2 text-xs text-zinc-400">{t._sum?.quantity} sold</span>
                      </span>
                      <span className="font-mono font-bold">${(t._sum?.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Link href="/categories" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700">
          Manage Categories
        </Link>
        <Link href="/products" className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm text-white hover:bg-purple-700">
          Manage Products
        </Link>
        <Link href="/sales" className="rounded-lg bg-green-600 px-5 py-2.5 text-sm text-white hover:bg-green-700">
          View Sales
        </Link>
      </div>
    </div>
  );
}
'''

# Write all files
for path, content in files.items():
    full = os.path.join(base, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)

print(f"Created {len(files)} files")

