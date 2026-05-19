import AdminShell from "../../../../components/admin/AdminShell";
import OrderDetails from "../../../../components/admin/OrderDetails";

type AdminOrderDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailsPage({
  params,
}: AdminOrderDetailsPageProps) {
  const { id } = await params;

  return (
    <AdminShell>
      <OrderDetails orderId={id} />
    </AdminShell>
  );
}


