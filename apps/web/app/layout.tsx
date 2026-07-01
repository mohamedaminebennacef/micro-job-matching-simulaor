import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CampusGigs",
  description:
    "Micro-job matching simulator for campus employers and student workers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sansFont.variable} bg-[var(--page-bg)] text-[var(--page-fg)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
