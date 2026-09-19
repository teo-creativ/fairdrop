"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/drops", label: "Live Drop" },
  { href: "/marketplace", label: "Secondary Market" },
  { href: "/collection", label: "My Collection" },
];

export function Header() {
  return (
    <header className="bg-gradient-to-r from-header-start to-header-end px-8 py-4 flex items-center justify-between">
      <Link href="/drops">
        <Image src="/logo-fairdrop.svg" alt="FairDrop" width={150} height={40} />
      </Link>

      <nav className="flex gap-8 text-white">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:opacity-80">
            {link.label}
          </Link>
        ))}
      </nav>

      <ConnectButton />
    </header>
  );
}
