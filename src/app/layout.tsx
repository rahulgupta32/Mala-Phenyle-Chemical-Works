import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mala Phenyle Chemical Works | Cleaning & Hygiene Products Nepal",
  description: "Official online store of Mala Phenyle Chemical Works. Order White Phenyle, Black Phenyle, Toilet Cleaner, Liquid Soap, Detergents directly from the manufacturer in Birgunj. Delivery across Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
