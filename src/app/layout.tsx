import type { Metadata } from "next";
import { Outfit, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/store/provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALAYN Intelligence",
  description: "Restaurant Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F7F9] text-gray-900 font-sans"><ReduxProvider>{children}</ReduxProvider></body>
    </html>
  );
}
