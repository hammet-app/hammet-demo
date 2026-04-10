import type { Metadata } from "next";
import { dmSans, plusJakarta } from "@/lib/utils/fonts";
import { AuthProvider } from "@/lib/auth/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Studies by Hammet",
  description: "AI literacy curriculum platform for Nigerian secondary schools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${plusJakarta.variable}`}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
