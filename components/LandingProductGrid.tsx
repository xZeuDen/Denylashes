import { Product } from "../lib/types";
import ProductCard from "./ProductCard";

type LandingProductGridProps = {
  products: Product[];
};

const LandingProductGrid = ({ products }: LandingProductGridProps) => {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-6 lg:pb-32">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default LandingProductGrid;

