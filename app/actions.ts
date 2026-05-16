"use server";

import { revalidatePath } from "next/cache";
import { createItem, updateItem, deleteItem } from "@/app/lib/db";

export async function createAction(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title?.trim()) {
    return { error: "Title is required" };
  }

  createItem(title.trim(), description?.trim() ?? "");
  revalidatePath("/");
}

export async function updateAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!id || !title?.trim()) {
    return { error: "ID and title are required" };
  }

  updateItem(id, title.trim(), description?.trim() ?? "");
  revalidatePath("/");
}

export async function deleteAction(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return { error: "ID is required" };
  }

  deleteItem(id);
  revalidatePath("/");
}

