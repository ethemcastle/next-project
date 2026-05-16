import os

base = os.path.dirname(os.path.abspath(__file__))

# Products actions
os.makedirs(os.path.join(base, "app/products"), exist_ok=True)
os.makedirs(os.path.join(base, "app/sales"), exist_ok=True)

with open(os.path.join(base, "app/products/actions.ts"), "w") as f:
    f.write('''"use server";

import { revalidatePath } from "next/cache";
import { createProduct, updateProduct, deleteProduct } from "@/app/lib/db";

export async function createProductAction(formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const categoryId = formData.get("categoryId") as string;

  if (!name?.trim() || isNaN(price) || isNaN(stock) || !categoryId) return;

  await createProduct(name.trim(), price, stock, categoryId);
  revalidatePath("/products");
}

export async function updateProductAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const categoryId = formData.get("categoryId") as string;

  if (!id || !name?.trim() || isNaN(price) || isNaN(stock) || !categoryId) return;

  await updateProduct(id, name.trim(), price, stock, categoryId);
  revalidatePath("/products");
}

export async function deleteProductAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteProduct(id);
  revalidatePath("/products");
}
''')

# Sales actions
with open(os.path.join(base, "app/sales/actions.ts"), "w") as f:
    f.write('''"use server";

import { revalidatePath } from "next/cache";
import { createSale, deleteSale } from "@/app/lib/db";

export async function createSaleAction(formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);

  if (!productId || isNaN(quantity) || quantity <= 0) return;

  await createSale(productId, quantity);
  revalidatePath("/sales");
}

export async function deleteSaleAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteSale(id);
  revalidatePath("/sales");
}
''')

# Categories page
with open(os.path.join(base, "app/categories/page.tsx"), "w") as f:
    f.write('''import { getCategories } from "@/app/lib/db";
import CategoryList from "./category-list";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <CategoryList categories={categories} />
    </div>
  );
}
''')

# Categories client component
with open(os.path.join(base, "app/categories/category-list.tsx"), "w") as f:
    f.write('''"use client";

import { useState } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./actions";

type Category = {
  id: string;
  name: string;
  createdAt: Date;
  _count: { products: number };
};

export default function CategoryList({ categories }: { categories: Category[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Categories</h1>

      <form
        action={createCategoryAction}
        className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      >
        <h2 className="text-lg font-semibold">Add Category</h2>
        <input
          name="name"
          placeholder="Category name"
          required
          className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create
        </button>
      </form>

      {categories.length === 0 ? (
        <p className="text-zinc-500">No categories yet.</p>
      ) : (
        <ul className="space-y-4">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            >
              {editingId === cat.id ? (
                <form
                  action={async (formData) => {
                    await updateCategoryAction(formData);
                    setEditingId(null);
                  }}
                  className="flex gap-2"
                >
                  <input type="hidden" name="id" value={cat.id} />
                  <input
                    name="name"
                    defaultValue={cat.name}
                    required
                    className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <button type="submit" className="rounded bg-green-600 px-3 py-1 text-white">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded bg-zinc-500 px-3 py-1 text-white">
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{cat.name}</h3>
                    <p className="text-sm text-zinc-500">{cat._count.products} product(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(cat.id)} className="rounded bg-yellow-500 px-3 py-1 text-white">
                      Edit
                    </button>
                    <form action={deleteCategoryAction}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button type="submit" className="rounded bg-red-600 px-3 py-1 text-white">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
''')

# Products page
with open(os.path.join(base, "app/products/page.tsx"), "w") as f:
    f.write('''import { getProducts, getCategories } from "@/app/lib/db";
import ProductList from "./product-list";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <ProductList products={products} categories={categories} />
    </div>
  );
}
''')

# Products client component
with open(os.path.join(base, "app/products/product-list.tsx"), "w") as f:
    f.write('''"use client";

import { useState } from "react";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "./actions";

type Category = { id: string; name: string; createdAt: Date; _count: { products: number } };
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: Date;
};

export default function ProductList({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Products</h1>

      <form
        action={createProductAction}
        className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      >
        <h2 className="text-lg font-semibold">Add Product</h2>
        <input name="name" placeholder="Product name" required className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
        <div className="flex gap-3">
          <input name="price" type="number" step="0.01" placeholder="Price" required className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
          <input name="stock" type="number" placeholder="Stock" required className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
        </div>
        <select name="categoryId" required className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800">
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create
        </button>
      </form>

      {products.length === 0 ? (
        <p className="text-zinc-500">No products yet. Create categories first, then add products.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => (
            <li key={p.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              {editingId === p.id ? (
                <form
                  action={async (formData) => {
                    await updateProductAction(formData);
                    setEditingId(null);
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <input name="name" defaultValue={p.name} required className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
                  <div className="flex gap-3">
                    <input name="price" type="number" step="0.01" defaultValue={p.price} required className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
                    <input name="stock" type="number" defaultValue={p.stock} required className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
                  </div>
                  <select name="categoryId" defaultValue={p.categoryId} required className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className="rounded bg-green-600 px-3 py-1 text-white">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded bg-zinc-500 px-3 py-1 text-white">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-zinc-500">Category: {p.category.name}</p>
                    <p className="text-sm text-zinc-500">Price: ${p.price.toFixed(2)} | Stock: {p.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(p.id)} className="rounded bg-yellow-500 px-3 py-1 text-white">Edit</button>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="rounded bg-red-600 px-3 py-1 text-white">Delete</button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
''')

# Sales page
with open(os.path.join(base, "app/sales/page.tsx"), "w") as f:
    f.write('''import { getSales, getProducts } from "@/app/lib/db";
import SaleList from "./sale-list";

export default async function SalesPage() {
  const [sales, products] = await Promise.all([getSales(), getProducts()]);

  return (
    <div className="flex flex-1 items-start justify-center py-12">
      <SaleList sales={sales} products={products} />
    </div>
  );
}
''')

# Sales client component
with open(os.path.join(base, "app/sales/sale-list.tsx"), "w") as f:
    f.write('''"use client";

import { createSaleAction, deleteSaleAction } from "./actions";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: Date;
};

type Sale = {
  id: string;
  productId: string;
  quantity: number;
  total: number;
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
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales</h1>
        <div className="text-right">
          <p className="text-sm text-zinc-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <form
        action={createSaleAction}
        className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      >
        <h2 className="text-lg font-semibold">Record a Sale</h2>
        <select name="productId" required className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800">
          <option value="">Select product</option>
          {products.filter(p => p.stock > 0).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (${p.price.toFixed(2)} — {p.stock} in stock)
            </option>
          ))}
        </select>
        <input
          name="quantity"
          type="number"
          min="1"
          placeholder="Quantity"
          required
          className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
        />
        <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          Sell
        </button>
      </form>

      {sales.length === 0 ? (
        <p className="text-zinc-500">No sales recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {sales.map((sale) => (
            <li key={sale.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{sale.product.name}</h3>
                  <p className="text-sm text-zinc-500">
                    {sale.quantity} x ${sale.product.price.toFixed(2)} = ${sale.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-zinc-500">Category: {sale.product.category.name}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(sale.createdAt).toLocaleString()}
                  </p>
                </div>
                <form action={deleteSaleAction}>
                  <input type="hidden" name="id" value={sale.id} />
                  <button type="submit" className="rounded bg-red-600 px-3 py-1 text-white text-sm">
                    Refund
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
''')

print("All files created!")

