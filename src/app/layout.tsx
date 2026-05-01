import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Nunito, Atkinson_Hyperlegible } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-head" });
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "AI Studies by Hammet",
  description: "AI literacy curriculum platform for Nigerian secondary schools",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${atkinson.variable}`}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
