import AnnouncementBar from "../../components/AnnouncementBar";
import HeaderNav from "../../components/HeaderNav";
import NewsletterFooter from "../../components/NewsletterFooter";
import ProductGrid from "../../components/ProductGrid";
import { getActiveProducts } from "../../lib/supabase/queries";

export default async function ProductsPage() {
  const { data: products, usingMock } = await getActiveProducts();

  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main>
        <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 pt-12 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Denylashes products
          </p>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
            Premium lash essentials & education
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Curated tools, lash trays, liquids, and digital courses designed for
            artists who want results that feel effortless.
          </p>
        </section>
        <ProductGrid products={products} usingMock={usingMock} />
      </main>
      <NewsletterFooter />
    </div>
  );
}


