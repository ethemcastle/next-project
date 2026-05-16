import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ToastProvider } from "@/app/components/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Product Sales Manager",
  description: "Manage categories, products, and sales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="max-w-5xl mx-auto flex gap-6 px-6 py-4">
              <Link href="/" className="font-bold text-lg">
                📊 Dashboard
              </Link>
              <Link
                href="/categories"
                className="hover:underline text-zinc-600 dark:text-zinc-400"
              >
                Categories
              </Link>
              <Link
                href="/products"
                className="hover:underline text-zinc-600 dark:text-zinc-400"
              >
                Products
              </Link>
              <Link
                href="/sales"
                className="hover:underline text-zinc-600 dark:text-zinc-400"
              >
                Sales
              </Link>
            </div>
          </nav>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
