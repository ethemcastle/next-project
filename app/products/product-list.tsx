"use client";

import { useState, useMemo } from "react";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  bulkDeleteAction,
  bulkStatusAction,
} from "./actions";
import { useProducts } from "./context";
import type { ProductWithCategory } from "@/app/lib/db";
import { Modal } from "@/app/components/modal";
import { Badge } from "@/app/components/badge";

type SortKey = "name" | "price" | "stock" | "createdAt" | "status";
type SortDir = "asc" | "desc";

export default function ProductList() {
  const { products, categories } = useProducts();
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductWithCategory | null>(null);
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

  const stockBadge = (p: ProductWithCategory) => {
    if (p.stock === 0) return <Badge variant="danger">Out of stock</Badge>;
    if (p.stock <= p.minStock) return <Badge variant="warning">Low stock</Badge>;
    return <Badge variant="success">{p.stock} in stock</Badge>;
  };

  const margin = (p: ProductWithCategory) => {
    if (p.cost === 0) return null;
    const pct = ((p.price - p.cost) / p.price) * 100;
    return pct.toFixed(0) + "% margin";
  };

  const catName = (p: ProductWithCategory) => p.category?.name ?? "—";
  const catColor = (p: ProductWithCategory) => p.category?.color ?? "#888";

  const inputCls = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800";

  const formFields = (defaults?: ProductWithCategory) => (
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
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-sm text-zinc-500">{products.length} total, {filtered.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600">
            {viewMode === "grid" ? "Table" : "Grid"} View
          </button>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            + New Product
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search name, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800">
          <option value="">All Categories</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={sortKey + "-" + sortDir} onChange={(e) => { const [k, d] = e.target.value.split("-") as [SortKey, SortDir]; setSortKey(k); setSortDir(d); }} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800">
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

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm dark:bg-blue-950">
          <span className="font-medium">{selected.size} selected</span>
          <form action={bulkStatusAction}><input type="hidden" name="ids" value={JSON.stringify([...selected])} /><input type="hidden" name="status" value="active" /><button type="submit" className="text-green-600 hover:underline">Activate</button></form>
          <form action={bulkStatusAction}><input type="hidden" name="ids" value={JSON.stringify([...selected])} /><input type="hidden" name="status" value="archived" /><button type="submit" className="text-yellow-600 hover:underline">Archive</button></form>
          <form action={bulkDeleteAction} onSubmit={(e) => { if (!confirm("Delete selected?")) e.preventDefault(); }}><input type="hidden" name="ids" value={JSON.stringify([...selected])} /><button type="submit" className="text-red-600 hover:underline">Delete</button></form>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-zinc-500 hover:underline">Clear</button>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Product">
        <form action={async (fd) => { await createProductAction(fd); setShowCreate(false); }} className="space-y-4">
          {formFields()}
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">Create Product</button>
        </form>
      </Modal>

      <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product">
        {editingProduct && (
          <form action={async (fd) => { await updateProductAction(fd); setEditingProduct(null); }} className="space-y-4">
            <input type="hidden" name="id" value={editingProduct.id} />
            {formFields(editingProduct)}
            <button type="submit" className="w-full rounded-lg bg-green-600 py-2 text-white hover:bg-green-700">Save Changes</button>
          </form>
        )}
      </Modal>

      <Modal open={!!detailProduct} onClose={() => setDetailProduct(null)} title="Product Details">
        {detailProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-zinc-500">Name:</span> {detailProduct.name}</div>
              <div><span className="text-zinc-500">SKU:</span> {detailProduct.sku || "\u2014"}</div>
              <div><span className="text-zinc-500">Price:</span> ${detailProduct.price.toFixed(2)}</div>
              <div><span className="text-zinc-500">Cost:</span> ${detailProduct.cost.toFixed(2)}</div>
              <div><span className="text-zinc-500">Stock:</span> {detailProduct.stock}</div>
              <div><span className="text-zinc-500">Min Stock:</span> {detailProduct.minStock}</div>
              <div><span className="text-zinc-500">Category:</span> {catName(detailProduct)}</div>
              <div><span className="text-zinc-500">Status:</span> {statusBadge(detailProduct.status)}</div>
              <div><span className="text-zinc-500">Margin:</span> {margin(detailProduct) || "\u2014"}</div>
            </div>
          </div>
        )}
      </Modal>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-500">No products found</p>
          <p className="text-sm text-zinc-400 mt-1">Try adjusting your filters or create a new product</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className={`group relative rounded-xl border p-4 transition-shadow hover:shadow-md ${selected.has(p.id) ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30" : "border-zinc-200 dark:border-zinc-700"}`}>
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="absolute left-3 top-3" />
              <div className="ml-6">
                <div className="flex items-start justify-between">
                  <button onClick={() => setDetailProduct(p)} className="text-left"><h3 className="font-semibold hover:text-blue-600">{p.name}</h3></button>
                  {statusBadge(p.status)}
                </div>
                <p className="mt-1 text-xs" style={{ color: catColor(p) }}>{catName(p)}</p>
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
                  <form action={deleteProductAction}><input type="hidden" name="id" value={p.id} /><button type="submit" className="text-xs text-red-600 hover:underline">Delete</button></form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="p-3 text-left"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filtered.map((p) => (
                <tr key={p.id} className={selected.has(p.id) ? "bg-blue-50/50 dark:bg-blue-950/30" : ""}>
                  <td className="p-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td className="p-3"><button onClick={() => setDetailProduct(p)} className="text-left hover:text-blue-600"><p className="font-medium">{p.name}</p>{p.sku && <p className="text-xs text-zinc-400">SKU: {p.sku}</p>}</button></td>
                  <td className="p-3" style={{ color: catColor(p) }}>{catName(p)}</td>
                  <td className="p-3 text-right font-medium">${p.price.toFixed(2)}</td>
                  <td className="p-3 text-right">{stockBadge(p)}</td>
                  <td className="p-3 text-center">{statusBadge(p.status)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingProduct(p)} className="text-yellow-600 hover:underline">Edit</button>
                      <form action={deleteProductAction}><input type="hidden" name="id" value={p.id} /><button type="submit" className="text-red-600 hover:underline">Delete</button></form>
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
