import type { Metadata } from "next";
import { Inter, Architects_Daughter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const doodleFont = Architects_Daughter({
  subsets: ["latin"],
  variable: "--font-doodle",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PPDDFF - Local File Converter",
  description: "Convert, merge, split, and compress PDFs, images, spreadsheets, and documents locally and securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${doodleFont.variable}`}>
      <body className="min-h-screen bg-[#FAF9F7] font-sans antialiased text-[#111827]">
        {children}
      </body>
    </html>
  );
}
