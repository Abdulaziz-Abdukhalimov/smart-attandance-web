import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Smart Attendance",
  description: "Maktab davomatini oson boshqaring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
