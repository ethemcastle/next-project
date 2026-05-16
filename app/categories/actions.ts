"use server";

import { revalidatePath } from "next/cache";
import { createCategory, updateCategory, deleteCategory } from "@/app/lib/db";

export async function createCategoryAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  await createCategory(name.trim());
  revalidatePath("/categoriese");
}

export async function updateCategoryAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  if (!id || !name?.trim()) return;
  await updateCategory(id, name.trim());
  revalidatePath("/categoriese");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;
  await deleteCategory(id);
  revalidatePath("/categoriese");
}

