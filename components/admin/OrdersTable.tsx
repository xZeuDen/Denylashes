"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "../../lib/supabase/client";
import { formatEur } from "../../lib/format";
import { useAdminToast } from "./AdminShell";

type OrderRow = {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
};

const visibleOrderStatuses = ["paid", "refunded"];
const statusOptions = ["all", ...visibleOrderStatuses];

const OrdersTable = () => {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { pushToast } = useAdminToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("30");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("v_latest_orders")
        .select("*")
        .in("status", visibleOrderStatuses)
        .order("created_at", { ascending: false });

      if (error) {
        pushToast({
          tone: "error",
          title: "Could not load orders",
          message: error.message,
        });
      }

      setOrders((data ?? []) as OrderRow[]);
      setLoading(false);
    };

    loadOrders();
  }, [pushToast, supabase]);

  const filtered = useMemo(() => {
    const days = Number.parseInt(range, 10);
    const cutoff = Number.isFinite(days)
      ? Date.now() - days * 24 * 60 * 60 * 1000
      : 0;

    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const created = Date.parse(order.created_at);
      const matchesDate = !cutoff || created >= cutoff;
      return matchesStatus && matchesDate;
    });
  }, [orders, status, range]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Orders
          </p>
          <h2 className="text-2xl font-semibold text-ink">Latest orders</h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-border bg-white p-4 shadow-soft">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="ml-3 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Date range
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="ml-3 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fff6fb] text-xs uppercase tracking-[0.2em] text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted" colSpan={5}>
                  Loading orders…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-muted" colSpan={5}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">
                      {order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted">
                      {order.customer_email ??
                        order.customer_name ??
                        order.user_id ??
                        "Guest customer"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {formatEur(order.total_cents)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:text-ink/70"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrdersTable;


