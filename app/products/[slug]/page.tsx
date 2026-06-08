import Link from "next/link";
import AnnouncementBar from "../../../components/AnnouncementBar";
import HeaderNav from "../../../components/HeaderNav";
import NewsletterFooter from "../../../components/NewsletterFooter";
import ProductGallery from "../../../components/ProductGallery";
import ProductPurchasePanel from "../../../components/ProductPurchasePanel";
import SimilarProducts from "../../../components/SimilarProducts";
import { getProductBySlug, getSimilarProducts } from "../../../lib/supabase/queries";

type ProductDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

const ProductDetailsPage = async ({ params }: ProductDetailsPageProps) => {
  const { slug } = await params;
  const { data: product, images, variants, usingMock } = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-ink">
        <AnnouncementBar />
        <HeaderNav />
        <main className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Product not found
          </p>
          <h1 className="text-3xl font-semibold text-ink">
            This product is taking a beauty break.
          </h1>
          <p className="max-w-md text-sm text-muted">
            The item you are looking for is no longer available. Explore our
            latest collection instead.
          </p>
          <Link
            href="/products"
            className="rounded-full border border-border bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Back to products
          </Link>
        </main>
        <NewsletterFooter />
      </div>
    );
  }

  const { data: similar } = await getSimilarProducts(product.category, product.id);

  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-4 py-12 sm:px-6">
        {usingMock ? (
          <p className="rounded-[16px] border border-border bg-[#fff6fb] px-4 py-3 text-xs text-muted">
            Supabase env vars are missing, showing curated mock products for now.
          </p>
        ) : null}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <ProductGallery
            mainImage={product.image_url}
            images={images}
            title={product.title}
          />
          <ProductPurchasePanel product={product} variants={variants} />
        </section>

        <section className="grid gap-8 rounded-[20px] border border-border bg-white p-6 shadow-soft lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-ink">Description</h2>
            <p className="mt-3 text-sm text-muted">
              {product.description ||
                "Thoughtfully designed to deliver consistent, premium results for artists and clients alike."}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">What’s included</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {product.type === "digital" ? (
                <>
                  <li>• Video modules + downloadable resources</li>
                  <li>• Lifetime access to updates</li>
                  <li>• Completion certificate where included</li>
                </>
              ) : (
                <>
                  <li>• Premium-grade product materials</li>
                  <li>• Signature Denylashes packaging</li>
                  <li>• Care & usage guide</li>
                </>
              )}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-ink">Shipping & returns</h2>
            <p className="mt-3 text-sm text-muted">
              Physical orders are prepared with signature Denylashes packaging
              and tracked delivery. Digital purchases are delivered by email
              after payment is confirmed.
            </p>
          </div>
        </section>

        <SimilarProducts products={similar} />
      </main>
      <NewsletterFooter />
    </div>
  );
};

export default ProductDetailsPage;


