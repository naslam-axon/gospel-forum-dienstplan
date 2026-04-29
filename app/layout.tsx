import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gospel Forum Dienstplan",
  description: "Dienstplanung Gospel Forum Stuttgart",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F5F5F0] text-[#1A1A1A]">
        <header className="bg-[#1A1A1A] text-white px-6 py-3 flex items-center gap-3">
          <span className="w-2 h-6 bg-[#C8102E] rounded-sm block" />
          <span className="font-semibold tracking-wide text-sm">Gospel Forum Stuttgart — Dienstplan</span>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
