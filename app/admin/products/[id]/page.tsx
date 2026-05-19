import AdminShell from "../../../../components/admin/AdminShell";
import ImageManager from "../../../../components/admin/ImageManager";
import ProductForm from "../../../../components/admin/ProductForm";

type AdminProductEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const { id } = await params;

  return (
    <AdminShell>
      <div className="flex flex-col gap-8">
        <ProductForm productId={id} />
        <ImageManager productId={id} />
      </div>
    </AdminShell>
  );
}


