"use server";

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
