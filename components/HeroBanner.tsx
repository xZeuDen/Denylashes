import Image from "next/image";
import Link from "next/link";

const HeroBanner = () => {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:pb-28">
      <div className="relative h-[420px] overflow-hidden rounded-[32px] sm:h-[480px] lg:h-[600px]">
        <Image
          src="/images/hero.svg"
          alt="Lash artistry closeup"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1280px"
        />
        <div className="hero-overlay absolute inset-0" aria-hidden="true" />
        <div className="absolute inset-0 flex items-end">
          <div className="p-8 text-white sm:p-10 lg:p-14">
            <h1 className="max-w-xl text-3xl font-semibold uppercase tracking-[0.12em] sm:text-4xl lg:text-5xl">
              BEAUTY UNLEASHED
            </h1>
            <p className="mt-4 max-w-lg text-sm text-white/85 sm:text-base">
              Elevating beauty through innovation and expertise, Denylashes is
              your gateway to lash perfection.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center rounded-full border border-white/70 bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;

