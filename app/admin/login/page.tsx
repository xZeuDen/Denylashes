"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "../../../lib/supabase/client";
import { gradients } from "../../../lib/tokens";

const AdminLoginPage = () => {
  const supabase = useMemo(() => createBrowserClient(), []);
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (response.error) {
      setStatus("error");
      setError(response.error.message);
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <div
        className="h-2 w-full"
        style={{ backgroundImage: gradients.accent }}
      />
      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Denylashes Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">
            Sign in to your dashboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Use your Denylashes admin credentials to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[22px] border border-border bg-white p-8 shadow-soft"
        >
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[18px] border border-border bg-white px-4 py-3 text-sm text-ink shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
          </label>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full border border-transparent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundImage: gradients.accent }}
          >
            {status === "loading"
              ? "Please wait…"
              : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
          </button>

          {status === "error" && error ? (
            <p className="rounded-[16px] border border-border bg-[#fff0f3] px-4 py-3 text-xs text-muted">
              {error}
            </p>
          ) : null}
        </form>

        <div className="text-center text-xs text-muted">
          {mode === "sign-in" ? "Need an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() =>
              setMode((prev) => (prev === "sign-in" ? "sign-up" : "sign-in"))
            }
            className="font-semibold text-ink underline underline-offset-4"
          >
            {mode === "sign-in" ? "Create one" : "Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminLoginPage;

