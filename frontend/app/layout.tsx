import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import "./globals.css";

const onest = Onest({
  weight: "400", // Regular uniquement — voir docs/design.md
  subsets: ["latin"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: "FairDrop",
  description: "Real-Time Anti-Scalp Liquidity on Monad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${onest.variable} font-sans`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
