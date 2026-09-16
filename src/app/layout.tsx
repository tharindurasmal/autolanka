import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "AutoLanka — Buy and sell vehicles in Sri Lanka",
    template: "%s | AutoLanka",
  },
  description: "Sri Lanka's vehicle marketplace. Cars, vans, SUVs, bikes and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}