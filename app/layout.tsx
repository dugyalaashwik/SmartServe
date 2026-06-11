import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Smart Serve — AI Concierge for Modern Salons",
  description:
    "Smart Serve is the always-on voice receptionist that books, reschedules, and upsells for salons — so your chairs are never empty.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-[#06142b]`}>
      <body className="font-sans antialiased bg-[#06142b] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
