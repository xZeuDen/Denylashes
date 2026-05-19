"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { gradients } from "../lib/tokens";
import {
  ApplePayIcon,
  ArrowRightIcon,
  GooglePayIcon,
  HeartIcon,
  InstagramIcon,
  MastercardIcon,
  TikTokIcon,
  VisaIcon,
} from "./icons";

const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "/contact";
const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || "/contact";

const NewsletterFooter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Could not save your email.");
      }

      setEmail("");
      setStatus("success");
      setMessage("You are on the Denylashes list.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not save your email."
      );
    }
  };

  return (
    <footer className="mt-8">
      <section
        className="w-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.45), transparent 45%), radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.35), transparent 50%), linear-gradient(90deg, #ffd6f3 0%, #ff4fd8 50%, #ffd6f3 100%)",
        }}
        aria-label="Newsletter"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-8 px-4 py-12 text-center sm:px-6 lg:py-16">
          <div className="flex flex-col gap-4">
            <h2 className="wordmark text-2xl font-semibold text-ink sm:text-3xl">
              Let&apos;s keep in touch
            </h2>
            <p className="max-w-xl text-sm text-ink/70">
              Join the Denylashes list for new product drops, education updates,
              and studio moments.
            </p>
          </div>

          <form className="w-full max-w-2xl" onSubmit={submitNewsletter}>
            <label className="relative block">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="w-full rounded-full border border-white/70 bg-white/80 px-6 py-4 pr-16 text-sm text-ink shadow-soft placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              />
              <button
                type="submit"
                aria-label="Submit email"
                disabled={status === "loading"}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white text-ink transition hover:-translate-y-[52%] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </label>
            {message ? (
              <p
                className={`mt-3 rounded-[16px] border border-white/70 bg-white/70 px-4 py-3 text-xs ${
                  status === "error" ? "text-ink" : "text-ink/70"
                }`}
              >
                {message}
              </p>
            ) : null}
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <HeartIcon className="h-4 w-4" aria-hidden="true" />
              Shop the edit
            </Link>
            <div className="flex items-center gap-4 text-ink">
              <Link
                href={instagramUrl}
                aria-label="Instagram"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/80 transition hover:-translate-y-0.5 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <InstagramIcon className="h-5 w-5" />
              </Link>
              <Link
                href={tiktokUrl}
                aria-label="TikTok"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/80 transition hover:-translate-y-0.5 hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <TikTokIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 bg-white/60">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-4 py-8 text-xs text-black/65 sm:px-6 lg:flex-row lg:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[ApplePayIcon, GooglePayIcon, MastercardIcon, VisaIcon].map(
                (Icon, index) => (
                  <Icon key={index} className="h-9 w-16 text-black/70" />
                )
              )}
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4 uppercase tracking-[0.18em]">
              <Link href="/shipping" className="transition hover:text-ink">
                Shipping
              </Link>
              <Link href="/returns" className="transition hover:text-ink">
                Returns
              </Link>
              <Link href="/privacy" className="transition hover:text-ink">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-ink">
                Terms
              </Link>
            </nav>
            <p className="text-center lg:text-right">© 2026, Denylashes</p>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default NewsletterFooter;
