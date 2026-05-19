import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import CartProvider from "../components/cart/CartProvider";
import CartToast from "../components/cart/CartToast";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Denylashes | Beauty Unleashed",
  description:
    "Elevating beauty through innovation and expertise. Premium lash products, courses, and tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans">
        <CartProvider>
          {children}
          <CartToast />
        </CartProvider>
      </body>
    </html>
  );
}

