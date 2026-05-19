"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "../../lib/supabase/client";
import { gradients } from "../../lib/tokens";

type Toast = {
  id: string;
  tone: "success" | "error";
  title: string;
  message?: string;
};

type AdminToastContextValue = {
  pushToast: (toast: Omit<Toast, "id">) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | undefined>(
  undefined
);

export const useAdminToast = () => {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within AdminShell");
  }
  return context;
};

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
];

const AdminShell = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied">(
    "loading"
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (isMounted) {
          router.push("/admin/login");
        }
        return;
      }
      setSessionEmail(sessionData.session.user.email ?? null);

      const { data, error } = await supabase.rpc("is_admin");
      if (error || !data) {
        if (isMounted) {
          setStatus("denied");
        }
        return;
      }
      if (isMounted) {
        setStatus("ready");
      }
    };

    checkAdmin();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const content = (() => {
    if (status === "loading") {
      return (
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
          Checking access…
        </div>
      );
    }

    if (status === "denied") {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Not authorized
          </p>
          <p className="text-sm text-muted">
            Your account doesn’t have admin access. Please contact the owner.
          </p>
          <Link
            href="/"
            className="rounded-full border border-border bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
          >
            Back to site
          </Link>
        </div>
      );
    }

    return children;
  })();

  return (
    <AdminToastContext.Provider value={{ pushToast }}>
      <div className="min-h-screen bg-white text-ink">
        <div
          className="h-2 w-full"
          style={{ backgroundImage: gradients.accent }}
        />
        <header className="border-b border-border bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-5 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Admin
              </p>
              <h1 className="wordmark text-2xl font-semibold text-ink">
                Denylashes Studio
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 text-xs uppercase tracking-[0.2em] text-muted">
              <span className="hidden sm:inline">{sessionEmail}</span>
              <Link
                href="/"
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
              >
                View store
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:border-ink/40"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-2 rounded-[18px] border border-border bg-white p-4 shadow-soft">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[14px] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "bg-ink text-white"
                      : "text-ink hover:-translate-y-0.5 hover:bg-[#fff6fb]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </aside>

          <div>{content}</div>
        </div>

        <div className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto w-[320px] rounded-[18px] border border-border bg-white p-4 shadow-soft ${
                toast.tone === "success"
                  ? "text-ink"
                  : "text-ink ring-1 ring-[#ffd6f3]"
              }`}
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message ? (
                <p className="mt-1 text-xs text-muted">{toast.message}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </AdminToastContext.Provider>
  );
};

export default AdminShell;
