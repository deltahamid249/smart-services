import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://almnusaa.com"),
  title: "الحلول التقنية الذكية",
  description: "منصة الخدمات التقنية والرقمية عن بُعد",

  openGraph: {
    title: "الحلول التقنية الذكية",
    description: "خدمات تقنية ورقمية بسهولة واحترافية عن بُعد",
    type: "website",
    locale: "ar_SD",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1080,
        height: 1440,
        alt: "الحلول التقنية الذكية",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "الحلول التقنية الذكية",
    description: "خدمات تقنية ورقمية بسهولة واحترافية عن بُعد",
    images: ["/opengraph-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
