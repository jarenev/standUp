import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StandUp — апгрейд скинов Standoff 2",
  description: "StandUp: апгрейд скинов, магазин, продажа и вывод голды Standoff 2.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className="min-h-screen text-slate-100 antialiased">{children}</body>
    </html>
  );
}
