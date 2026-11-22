import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "CareNova - Hospital Management",
  description: "CareNova hospital management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#050814] text-slate-100 font-sans min-h-screen selection:bg-cyan-400 selection:text-slate-950 relative">
        <AnimatedBackground />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
