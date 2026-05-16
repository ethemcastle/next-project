"use client";

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

  const totalRevenue = filtered.reduce((s, x) => s + (x.total ?? 0), 0);
  const totalProfit = filtered.reduce((s, x) => s + (x.profit ?? 0), 0);
  const totalUnits = filtered.reduce((s, x) => s + (x.quantity ?? 0), 0);

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
                  {p.name} — ${(p.price ?? 0).toFixed(2)} ({p.stock} in stock)
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
                  <td className="p-3 text-right">${(sale.unitPrice ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-right font-medium">${(sale.total ?? 0).toFixed(2)}</td>
                  <td className="p-3 text-right text-green-600">${(sale.profit ?? 0).toFixed(2)}</td>
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
