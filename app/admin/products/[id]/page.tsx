import AdminShell from "../../../../components/admin/AdminShell";
import ImageManager from "../../../../components/admin/ImageManager";
import ProductForm from "../../../../components/admin/ProductForm";

type AdminProductEditPageProps = {
  params: { id: string };
};

export default function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  return (
    <AdminShell>
      <div className="flex flex-col gap-8">
        <ProductForm productId={params.id} />
        <ImageManager productId={params.id} />
      </div>
    </AdminShell>
  );
}


