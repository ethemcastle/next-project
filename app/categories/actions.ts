"use server";

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
  await updateCategory(id, {
    name: name.trim(),
    description: description?.trim() ?? "",
    color: color || "#3b82f6",
  });
  revalidatePath("/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteCategory(id);
  revalidatePath("/categories");
}
