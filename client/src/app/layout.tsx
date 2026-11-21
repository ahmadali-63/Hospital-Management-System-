import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "Professional Hospital Management System MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
