import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { PortfolioProvider } from "@/lib/context/PortfolioContext";
import { ThemeScript } from "@/components/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gilberto Nascimento - Engenheiro de Manufatura",
  description: "Portfolio profissional de Gilberto Nascimento, Engenheiro de Manufatura especializado gestão de processos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <PortfolioProvider>
            {children}
          </PortfolioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
