import AdminShell from "../../../../components/admin/AdminShell";
import OrderDetails from "../../../../components/admin/OrderDetails";

type AdminOrderDetailsPageProps = {
  params: { id: string };
};

export default function AdminOrderDetailsPage({
  params,
}: AdminOrderDetailsPageProps) {
  return (
    <AdminShell>
      <OrderDetails orderId={params.id} />
    </AdminShell>
  );
}


