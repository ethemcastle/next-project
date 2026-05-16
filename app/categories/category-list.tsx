"use client";

import { useState } from "react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";
import { Modal } from "@/app/components/modal";
import type { CategoryWithCount } from "@/app/lib/db";

export default function CategoryList({ categories }: { categories: CategoryWithCount[] }) {
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
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + New Category
        </button>
      </div>

      <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800" />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Category">
        <form action={async (fd) => { await createCategoryAction(fd); setShowCreate(false); }} className="space-y-4">
          <input name="name" placeholder="Category name" required className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
          <textarea name="description" placeholder="Description (optional)" rows={3} className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800" />
          <div className="flex items-center gap-3">
            <label className="text-sm">Color</label>
            <input name="color" type="color" defaultValue="#3b82f6" className="h-10 w-14 rounded border-0 p-0" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700">Create Category</button>
        </form>
      </Modal>

      {filtered.length === 0 ? (
        <p className="text-center text-zinc-500 py-8">{search ? "No categories match your search." : "No categories yet. Create one!"}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700" style={{ borderLeftColor: cat.color, borderLeftWidth: 4 }}>
              {editingId === cat.id ? (
                <form action={async (fd) => { await updateCategoryAction(fd); setEditingId(null); }} className="space-y-3">
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
                      {cat.description && <p className="text-sm text-zinc-500 mt-1">{cat.description}</p>}
                    </div>
                    <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-500">{cat.productCount} product{cat.productCount !== 1 ? "s" : ""}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(cat.id)} className="text-sm text-yellow-600 hover:underline">Edit</button>
                      <form action={deleteCategoryAction}><input type="hidden" name="id" value={cat.id} /><button type="submit" className="text-sm text-red-600 hover:underline">Delete</button></form>
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
