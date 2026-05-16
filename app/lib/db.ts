import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Category ────────────────────────────────────────────────

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(name: string, description: string, color: string) {
  return prisma.category.create({ data: { name, description, color } });
}

export async function updateCategory(id: string, data: { name?: string; description?: string; color?: string }) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

// ─── Product ─────────────────────────────────────────────────

export async function getProducts(options?: {
  search?: string;
  categoryId?: string;
  status?: string;
  lowStock?: boolean;
}) {
  const where: Record<string, unknown> = {};

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } },
      { sku: { contains: options.search } },
    ];
  }
  if (options?.categoryId) where.categoryId = options.categoryId;
  if (options?.status) where.status = options.status;
  if (options?.lowStock) {
    where.stock = { lte: prisma.product.fields?.minStock ?? 5 };
  }

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      _count: { select: { sales: true } },
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      sales: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  sku?: string;
  imageUrl?: string;
  status?: string;
  categoryId: string;
}) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  sku?: string;
  imageUrl?: string;
  status?: string;
  categoryId?: string;
}) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

export async function bulkDeleteProducts(ids: string[]) {
  return prisma.product.deleteMany({ where: { id: { in: ids } } });
}

export async function bulkUpdateStatus(ids: string[], status: string) {
  return prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });
}

// ─── Sale ────────────────────────────────────────────────────

export async function getSales(options?: { productId?: string; dateFrom?: Date; dateTo?: Date }) {
  const where: Record<string, unknown> = {};
  if (options?.productId) where.productId = options.productId;
  if (options?.dateFrom || options?.dateTo) {
    where.createdAt = {
      ...(options?.dateFrom && { gte: options.dateFrom }),
      ...(options?.dateTo && { lte: options.dateTo }),
    };
  }

  return prisma.sale.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { product: { include: { category: true } } },
  });
}

export async function createSale(data: {
  productId: string;
  quantity: number;
  customer?: string;
  note?: string;
}) {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: data.productId },
  });

  if (product.stock < data.quantity) {
    throw new Error(`Not enough stock. Available: ${product.stock}`);
  }

  const unitPrice = product.price;
  const total = unitPrice * data.quantity;
  const profit = (unitPrice - product.cost) * data.quantity;

  const [sale] = await prisma.$transaction([
    prisma.sale.create({
      data: {
        productId: data.productId,
        quantity: data.quantity,
        unitPrice,
        total,
        profit,
        customer: data.customer ?? "",
        note: data.note ?? "",
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: { stock: { decrement: data.quantity } },
    }),
  ]);

  return sale;
}

export async function deleteSale(id: string) {
  const sale = await prisma.sale.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction([
    prisma.sale.delete({ where: { id } }),
    prisma.product.update({
      where: { id: sale.productId },
      data: { stock: { increment: sale.quantity } },
    }),
  ]);
}

// ─── Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats() {
  const [totalProducts, totalCategories, allSales, allProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.sale.findMany(),
      prisma.product.findMany({ include: { category: true } }),
    ]);

  const lowStockProducts = allProducts
    .filter((p) => p.stock <= 5 && p.status === "active")
    .sort((a, b) => a.stock - b.stock);

  const totalSales = allSales.length;
  const revenue = allSales.reduce((s, x) => s + (x.total ?? 0), 0);
  const profit = allSales.reduce((s, x) => s + (x.profit ?? 0), 0);

  const recentSales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { product: true },
  });

  // Compute top products in JS instead of groupBy (adapter limitation)
  const salesByProduct = new Map<string, { quantity: number; total: number }>();
  for (const s of allSales) {
    const existing = salesByProduct.get(s.productId) ?? { quantity: 0, total: 0 };
    existing.quantity += s.quantity;
    existing.total += s.total;
    salesByProduct.set(s.productId, existing);
  }
  const topProductEntries = [...salesByProduct.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const topProducts = topProductEntries.map(([productId, sums]) => ({
    productId,
    _sum: { quantity: sums.quantity, total: sums.total },
    product: allProducts.find((p) => p.id === productId)!,
  }));

  return {
    totalProducts,
    totalCategories,
    totalSales,
    revenue,
    profit,
    lowStockProducts,
    recentSales,
    topProducts,
  };
}
