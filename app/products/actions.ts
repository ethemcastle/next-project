"use server";

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
