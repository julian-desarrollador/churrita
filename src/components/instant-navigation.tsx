"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { PageSkeleton } from "@/components/page-skeleton";

const PendingContext = createContext<string | null>(null);
const BeginContext = createContext<(href: string) => void>(() => {});

export function usePendingHref() {
  return useContext(PendingContext);
}

export function useBeginNavigation() {
  return useContext(BeginContext);
}

export function InstantNavigation({ children }: { children: ReactNode }) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const raw = anchor.getAttribute("href");
      if (!raw || raw.startsWith("#")) return;
      let next: string;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        next = canonical(url.href);
      } catch {
        return;
      }
      if (next === canonical(window.location.href)) return;
      if (new URL(next, window.location.origin).pathname !== window.location.pathname) {
        window.scrollTo({ top: 0 });
      }
      setPendingHref(next);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!pendingHref) return;
    const id = window.setTimeout(() => setPendingHref(null), 10000);
    return () => window.clearTimeout(id);
  }, [pendingHref]);

  const begin = useCallback((href: string) => {
    setPendingHref(canonical(href));
  }, []);
  const clear = useCallback(() => setPendingHref(null), []);

  return (
    <BeginContext.Provider value={begin}>
      <PendingContext.Provider value={pendingHref}>
        <Suspense fallback={null}>
          <ClearPending onDone={clear} />
        </Suspense>
        {children}
        {pendingHref ? <NavigationBar /> : null}
      </PendingContext.Provider>
    </BeginContext.Provider>
  );
}

export function InstantContent({ children }: { children: ReactNode }) {
  const pendingHref = usePendingHref();
  const pathname = usePathname();
  const switchingPage = pendingHref ? pathnameOf(pendingHref) !== pathname : false;

  useEffect(() => {
    if (switchingPage) window.scrollTo({ top: 0 });
  }, [switchingPage]);

  return (
    <div className="relative">
      <div
        className={pendingHref && !switchingPage ? "pointer-events-none opacity-60" : undefined}
        inert={pendingHref ? true : undefined}
      >
        {children}
      </div>
      {switchingPage ? (
        <div className="absolute inset-0 z-10 bg-white">
          <PageSkeleton />
        </div>
      ) : null}
    </div>
  );
}

function ClearPending({ onDone }: { onDone: () => void }) {
  const pendingHref = usePendingHref();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const live = search ? `${pathname}?${search}` : pathname;

  useEffect(() => {
    if (pendingHref && canonical(pendingHref) === canonical(live)) onDone();
  }, [pendingHref, live, onDone]);

  return null;
}

function NavigationBar() {
  return (
    <div
      className="nav-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-leaf"
      role="progressbar"
      aria-label="Cargando"
    >
      <span />
    </div>
  );
}

function canonical(href: string) {
  const url = new URL(href, typeof window === "undefined" ? "https://churrita.local" : window.location.origin);
  const params = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
  const search = new URLSearchParams(params).toString();
  return search ? `${url.pathname}?${search}` : url.pathname;
}

function pathnameOf(href: string) {
  return new URL(href, "https://churrita.local").pathname;
}
