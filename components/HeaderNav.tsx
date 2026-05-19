"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CartIcon,
  HamburgerIcon,
  SearchIcon,
  UserIcon,
} from "./icons";
import useCart from "./cart/useCart";

const primaryLinks = ["Home", "Catalog", "Contact"];

const getHref = (label: string) => {
  if (label === "Catalog") return "/products";
  if (label === "Contact") return "/contact";
  return "/";
};

const HeaderNav = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getIsActive = (label: string) =>
    (label === "Home" && pathname === "/") ||
    (label === "Catalog" && pathname.startsWith("/products")) ||
    (label === "Contact" && pathname === "/contact");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 sm:px-6 lg:pb-10 lg:pt-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-6">
          <div className="flex items-start gap-4">
            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label="Open navigation menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
            >
              <HamburgerIcon className="h-5 w-5" />
            </button>
            <nav className="hidden flex-col gap-3 text-sm text-ink lg:flex">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {primaryLinks.map((label) => (
                  <li key={label}>
                    <Link
                      href={getHref(label)}
                      className={`group inline-flex items-center gap-1 ${
                        getIsActive(label) ? "font-semibold" : ""
                      }`}
                    >
                      <span className="transition group-hover:underline group-hover:underline-offset-4">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex-1 text-center lg:flex-none">
            <Link
              href="/"
              className="wordmark text-2xl font-semibold text-ink sm:text-3xl"
            >
              Denylashes
            </Link>
          </div>

          <div className="flex items-center justify-end gap-4">
            {[
              { Icon: SearchIcon, label: "Search", href: "/products" },
              { Icon: UserIcon, label: "Login", href: "/admin/login" },
              { Icon: CartIcon, label: "Cart", href: "/cart" },
            ].map(({ Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-border text-ink transition hover:-translate-y-0.5 hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Icon className="h-5 w-5" />
                {label === "Cart" && cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        {isMenuOpen ? (
          <nav className="mt-6 border-t border-border/70 pt-4 text-sm text-ink lg:hidden">
            <ul className="grid gap-2">
              {primaryLinks.map((label) => (
                <li key={label}>
                  <Link
                    href={getHref(label)}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block rounded-[14px] px-4 py-3 transition hover:bg-[#fff6fb] ${
                      getIsActive(label) ? "bg-[#fff6fb] font-semibold" : ""
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
};

export default HeaderNav;
