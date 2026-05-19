import AnnouncementBar from "../components/AnnouncementBar";
import HeaderNav from "../components/HeaderNav";
import HeroBanner from "../components/HeroBanner";
import NewsletterFooter from "../components/NewsletterFooter";
import LandingProductGrid from "../components/LandingProductGrid";
import { getActiveProducts } from "../lib/supabase/queries";

export default async function Home() {
  const { data: products } = await getActiveProducts();
  const featured = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main>
        <HeroBanner />
        <LandingProductGrid products={featured} />
      </main>
      <NewsletterFooter />
    </div>
  );
}

