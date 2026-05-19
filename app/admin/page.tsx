"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell, { useAdminToast } from "../../components/admin/AdminShell";
import StatCard from "../../components/admin/StatCard";
import { createBrowserClient } from "../../lib/supabase/client";
import { formatEur } from "../../lib/format";

type SalesMetrics = {
  total_cents: number;
  orders_count: number;
};

type OrderRow = {
  id: string;
  customer_email: string | null;
  status: string;
  total_cents: number;
  created_at: string;
};

const AdminHomeContent = () => {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { pushToast } = useAdminToast();
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [latestOrders, setLatestOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: metricsData, error: metricsError } = await supabase
        .from("v_sales_this_month")
        .select("*")
        .maybeSingle();

      if (metricsError) {
        pushToast({
          tone: "error",
          title: "Could not load sales data",
          message: metricsError.message,
        });
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("v_latest_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (ordersError) {
        pushToast({
          tone: "error",
          title: "Could not load latest orders",
          message: ordersError.message,
        });
      }

      setMetrics(metricsData as SalesMetrics);
      setLatestOrders((ordersData ?? []) as OrderRow[]);
    };

    loadDashboard();
  }, [pushToast, supabase]);

  return (
    <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Overview
            </p>
            <h2 className="text-2xl font-semibold text-ink">Admin dashboard</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
            >
              Manage products
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
            >
              View orders
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            label="Total sales this month"
            value={formatEur(metrics?.total_cents ?? 0)}
            helper="Paid orders only"
          />
          <StatCard
            label="Orders this month"
            value={`${metrics?.orders_count ?? 0}`}
            helper="Paid orders only"
          />
        </div>

        <section className="rounded-[20px] border border-border bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Latest orders</h3>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:text-ink/70"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-[16px] border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fff6fb] text-xs uppercase tracking-[0.2em] text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-muted" colSpan={4}>
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  latestOrders.map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-ink"
                        >
                          {order.id.slice(0, 8).toUpperCase()}
                        </Link>
                        <p className="text-xs text-muted">
                          {order.customer_email ?? "Guest customer"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-muted">
                        {order.status}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {formatEur(order.total_cents)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
  );
};

const AdminHomePage = () => {
  return (
    <AdminShell>
      <AdminHomeContent />
    </AdminShell>
  );
};

export default AdminHomePage;
