import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });

export const metadata: Metadata = {
  title: {
    template: "%s - Genesis Flow",
    default: "Genesis Flow",
  },
  description: "High-performance lead generation and form builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} font-sans min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
