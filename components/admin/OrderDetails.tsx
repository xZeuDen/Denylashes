"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "../../lib/supabase/client";
import { formatEur } from "../../lib/format";
import { useAdminToast } from "./AdminShell";

type OrderDetailsProps = {
  orderId: string;
};

type OrderData = {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  status: string;
  subtotal_cents: number | null;
  shipping_cents: number | null;
  total_cents: number;
  currency: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  product_title: string | null;
  variant_length: string | null;
  product: { title: string } | null;
};

type OrderItemRow = {
  id: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number | null;
  product_title: string | null;
  variant_length: string | null;
  product: { title: string } | { title: string }[] | null;
};

const OrderDetails = ({ orderId }: OrderDetailsProps) => {
  const supabase = useMemo(() => createBrowserClient(), []);
  const { pushToast } = useAdminToast();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError || !orderData) {
        pushToast({
          tone: "error",
          title: "Could not load order",
          message: orderError?.message,
        });
        setLoading(false);
        return;
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(
          "id, qty, unit_price_cents, line_total_cents, product_title, variant_length, product:products(title)"
        )
        .eq("order_id", orderId);

      if (itemsError) {
        pushToast({
          tone: "error",
          title: "Could not load items",
          message: itemsError.message,
        });
      }

      const normalizedItems = ((itemsData ?? []) as OrderItemRow[]).map(
        (item) => ({
          id: item.id,
          qty: item.qty,
          unit_price_cents: item.unit_price_cents,
          line_total_cents:
            item.line_total_cents ?? item.unit_price_cents * item.qty,
          product_title: item.product_title,
          variant_length: item.variant_length,
          product: Array.isArray(item.product)
            ? item.product[0] ?? null
            : item.product,
        })
      );

      setOrder(orderData as OrderData);
      setItems(normalizedItems);
      setLoading(false);
    };

    loadOrder();
  }, [orderId, pushToast, supabase]);

  if (loading) {
    return (
      <div className="rounded-[18px] border border-border bg-white p-6 text-sm text-muted shadow-soft">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-[18px] border border-border bg-white p-6 text-sm text-muted shadow-soft">
        Order not found.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Order details
          </p>
          <h2 className="text-2xl font-semibold text-ink">
            Order {order.id.slice(0, 8).toUpperCase()}
          </h2>
        </div>
        <Link
          href="/admin/orders"
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
        >
          Back to orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <div className="rounded-[20px] border border-border bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Status
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">
                {order.status}
              </p>
            </div>
            <div className="text-sm text-muted">
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm text-muted">
            <p>
              <span className="font-semibold text-ink">Customer:</span>{" "}
              {order.customer_name ?? "Guest customer"}
            </p>
            <p>
              <span className="font-semibold text-ink">Email:</span>{" "}
              {order.customer_email ?? "Not captured yet"}
            </p>
            {order.customer_phone ? (
              <p>
                <span className="font-semibold text-ink">Phone:</span>{" "}
                {order.customer_phone}
              </p>
            ) : null}
            <p>
              <span className="font-semibold text-ink">Subtotal:</span>{" "}
              {formatEur(order.subtotal_cents ?? order.total_cents)}
            </p>
            <p>
              <span className="font-semibold text-ink">Delivery:</span>{" "}
              {formatEur(order.shipping_cents ?? 0)}
            </p>
            <p>
              <span className="font-semibold text-ink">Order total:</span>{" "}
              {formatEur(order.total_cents)}
            </p>
            {order.paid_at ? (
              <p>
                <span className="font-semibold text-ink">Paid:</span>{" "}
                {new Date(order.paid_at).toLocaleString()}
              </p>
            ) : null}
            {order.stripe_session_id ? (
              <p>
                <span className="font-semibold text-ink">Stripe session:</span>{" "}
                {order.stripe_session_id}
              </p>
            ) : null}
            {order.stripe_payment_intent_id ? (
              <p>
                <span className="font-semibold text-ink">Payment intent:</span>{" "}
                {order.stripe_payment_intent_id}
              </p>
            ) : null}
            <p className="text-xs text-muted">
              Stripe webhooks update payment status automatically.
            </p>
          </div>
        </div>

        <div className="rounded-[20px] border border-border bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-ink">Items</h3>
          <div className="mt-4 space-y-3 text-sm text-muted">
            {items.length === 0 ? (
              <p>No items found.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {item.product?.title ??
                        item.product_title ??
                        "Product removed"}
                    </p>
                    <p className="text-xs text-muted">
                      Qty {item.qty} x {formatEur(item.unit_price_cents)}
                      {item.variant_length ? ` · Length ${item.variant_length}` : ""}
                    </p>
                  </div>
                  <p className="text-sm text-ink">
                    {formatEur(item.line_total_cents)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-border bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-ink">Delivery address</h3>
        {order.shipping_line1 ? (
          <div className="mt-4 space-y-1 text-sm text-muted">
            <p className="font-semibold text-ink">
              {order.shipping_name ?? order.customer_name ?? "Customer"}
            </p>
            <p>{order.shipping_line1}</p>
            {order.shipping_line2 ? <p>{order.shipping_line2}</p> : null}
            <p>
              {[order.shipping_city, order.shipping_state, order.shipping_postal_code]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>{order.shipping_country}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No delivery address captured yet. Stripe will add it after checkout
            for physical orders.
          </p>
        )}
      </div>
    </section>
  );
};

export default OrderDetails;
