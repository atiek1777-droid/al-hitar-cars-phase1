import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-tajawal"
});

export const metadata: Metadata = {
  title: "مكتب الهتار كارز | AL-HITAR CARS",
  description: "نظام إدارة تأجير السيارات والسفريات - مكتب الهتار كارز"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
