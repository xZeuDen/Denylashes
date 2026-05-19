"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import AnnouncementBar from "../../components/AnnouncementBar";
import HeaderNav from "../../components/HeaderNav";
import NewsletterFooter from "../../components/NewsletterFooter";
import { gradients } from "../../lib/tokens";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const ContactPage = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Something went wrong.");
      }
      setStatus("success");
      setForm(initialState);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <AnnouncementBar />
      <HeaderNav />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-12 sm:px-6">
        <section className="grid gap-10 rounded-[24px] border border-border bg-white p-8 shadow-soft lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Contact Denylashes
            </p>
            <h1 className="text-3xl font-semibold text-ink">
              Let’s create something beautiful together
            </h1>
            <p className="text-sm text-muted">
              Send me a message and I will reply within 24–48 hours. Whether
              you’re looking for product guidance, wholesale, or course details,
              I’m here for you.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange("name")}
                  className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange("email")}
                  className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Subject
              <input
                type="text"
                required
                value={form.subject}
                onChange={handleChange("subject")}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Message
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={handleChange("message")}
                className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full border border-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundImage: gradients.accent }}
            >
              {status === "loading" ? "Sending..." : "Send message"}
            </button>

            {status === "success" ? (
              <p className="rounded-[16px] border border-border bg-[#fff6fb] px-4 py-3 text-xs text-muted">
                Thanks for reaching out. Your message has been sent.
              </p>
            ) : null}
            {status === "error" && error ? (
              <p className="rounded-[16px] border border-border bg-[#fff0f3] px-4 py-3 text-xs text-muted">
                {error}
              </p>
            ) : null}
          </form>
        </section>
      </main>
      <NewsletterFooter />
    </div>
  );
};

export default ContactPage;

