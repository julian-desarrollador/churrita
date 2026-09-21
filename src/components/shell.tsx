import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { Pwa } from "@/components/pwa";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <img src="/apple-touch-icon.png" alt="" width={36} height={36} className="h-9 w-9" />
            Churrita
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28">
        {children}
      </main>
      <Pwa />
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Nav />
      </div>
    </div>
  );
}
