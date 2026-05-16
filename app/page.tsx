import Link from "next/link";
import { getDashboardStats } from "@/app/lib/db";
import { StatCard } from "@/app/components/stat-card";

export default async function Page() {
  const stats = await getDashboardStats();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 py-12">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Overview of your product sales</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Products" value={stats.totalProducts} color="blue" />
        <StatCard label="Categories" value={stats.totalCategories} color="purple" />
        <StatCard label="Total Sales" value={stats.totalSales} color="green" />
        <StatCard
          label="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          color="green"
        />
        <StatCard
          label="Profit"
          value={`$${stats.profit.toFixed(2)}`}
          sub={stats.revenue > 0 ? `${((stats.profit / stats.revenue) * 100).toFixed(1)}% margin` : undefined}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">
            Low Stock Alerts
            {stats.lowStockProducts.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-700">
                {stats.lowStockProducts.length}
              </span>
            )}
          </h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {stats.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-zinc-400">{p.category.name}</span>
                  </div>
                  <span className={`font-mono font-bold ${p.stock === 0 ? "text-red-600" : "text-yellow-600"}`}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Sales */}
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
          <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
          {stats.recentSales.length === 0 ? (
            <p className="text-sm text-zinc-500">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{s.product.name}</span>
                    <span className="ml-2 text-xs text-zinc-400">x{s.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-green-600">${s.total.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Top Products by Revenue</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((t, i) => {
                const maxRevenue = stats.topProducts[0]?._sum?.total || 1;
                const pct = ((t._sum?.total || 0) / maxRevenue) * 100;
                return (
                  <div key={t.productId}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>
                        <span className="font-medium mr-2">#{i + 1}</span>
                        {t.product?.name}
                        <span className="ml-2 text-xs text-zinc-400">{t._sum?.quantity} sold</span>
                      </span>
                      <span className="font-mono font-bold">${(t._sum?.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Link href="/categories" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm text-white hover:bg-blue-700">
          Manage Categories
        </Link>
        <Link href="/products" className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm text-white hover:bg-purple-700">
          Manage Products
        </Link>
        <Link href="/sales" className="rounded-lg bg-green-600 px-5 py-2.5 text-sm text-white hover:bg-green-700">
          View Sales
        </Link>
      </div>
    </div>
  );
}
