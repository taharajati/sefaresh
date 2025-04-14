import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "طراحی فروشگاه اینترنتی حرفه‌ای",
  description: "طراحی و توسعه فروشگاه اینترنتی با جدیدترین تکنولوژی‌ها و طراحی‌های مدرن",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body suppressHydrationWarning className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
