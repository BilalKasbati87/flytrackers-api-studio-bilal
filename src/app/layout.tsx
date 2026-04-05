import type { Metadata } from "next";
import { Source_Sans_3, Syne } from "next/font/google";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const headingFont = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlyTrackers API Studio",
  description:
    "API-first starter for aviation intelligence, metasearch handoff, and travel partner integrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}