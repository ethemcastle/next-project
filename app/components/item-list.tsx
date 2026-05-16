"use client";

import { useState } from "react";
import { createAction, updateAction, deleteAction } from "@/app/actions";
import type { Item } from "@/app/lib/db";

export default function ItemList({ items }: { items: Item[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">CRUD Items</h1>

      {/* CREATE FORM */}
      <form
        action={createAction}
        className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
      >
        <h2 className="text-lg font-semibold">Add New Item</h2>
        <input
          name="title"
          placeholder="Title"
          required
          className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
        />
        <input
          name="description"
          placeholder="Description"
          className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create
        </button>
      </form>

      {/* LIST */}
      {items.length === 0 ? (
        <p className="text-zinc-500">No items yet. Create one above!</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
            >
              {editingId === item.id ? (
                /* UPDATE FORM */
                <form
                  action={async (formData) => {
                    await updateAction(formData);
                    setEditingId(null);
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="id" value={item.id} />
                  <input
                    name="title"
                    defaultValue={item.title}
                    required
                    className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <input
                    name="description"
                    defaultValue={item.description}
                    className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded bg-zinc-500 px-3 py-1 text-white hover:bg-zinc-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* READ */
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.description && (
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    {/* DELETE FORM */}
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
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

