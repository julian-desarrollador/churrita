"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const LINKS = [
  { href: "/", label: "Inicio", icon: IconHome },
  { href: "/nutricion", label: "Nutrición", icon: IconApple },
  { href: "/estudio", label: "Estudio", icon: IconBook },
  { href: "/ejercicio", label: "Ejercicio", icon: IconDumbbell },
  { href: "/contabilidad", label: "Contabilidad", icon: IconWallet },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto grid w-full max-w-3xl grid-cols-5">
      {LINKS.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-1 py-1 text-[10px] leading-none min-[380px]:text-[11px] ${
              active ? "font-semibold text-foreground" : "font-medium text-muted"
            }`}
          >
            <Icon />
            <span className="max-w-full truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function IconHome() {
  return (
    <Svg>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

function IconWallet() {
  return (
    <Svg>
      <rect x="3.5" y="6.5" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M15.5 14.5h2" />
    </Svg>
  );
}

function IconBook() {
  return (
    <Svg>
      <path d="M12 6.2c-1.6-1-3.4-1.4-5.5-1.4H5v13.4h1.8c1.9 0 3.6.4 5.2 1.4 1.6-1 3.3-1.4 5.2-1.4H19V4.8h-1.5c-2.1 0-3.9.4-5.5 1.4z" />
      <path d="M12 6.2v13.4" />
    </Svg>
  );
}

function IconDumbbell() {
  return (
    <Svg>
      <path d="M6.5 9v6M17.5 9v6M3.5 10.2v3.6M20.5 10.2v3.6M6.5 12h11" />
    </Svg>
  );
}

function IconApple() {
  return (
    <Svg>
      <path d="M12 7.2c.2-1.6 1.4-2.8 2.8-3.2-.2 1.8-1.3 3-2.8 3.2z" />
      <path d="M12 8.2c-2.8-.2-5 1.8-5 4.6 0 3.2 2.2 6.4 5 6.4s5-3.2 5-6.4c0-2.8-2.2-4.8-5-4.6z" />
    </Svg>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}
