import type { Metadata } from "next";
import "./globals.css";
import "./home-redesign.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://almnusaa.com"),
  title: "الحلول التقنية الذكية | خدمات رقمية عن بُعد",
  description:
    "حوّل فكرتك إلى إنجاز. اطلب خدمات التصميم والملفات والمواقع والحلول التقنية عن بُعد، مع تواصل واضح وتسليم عبر WhatsApp.",

  openGraph: {
    title: "عندك فكرة؟ خلّها تصير.",
    description:
      "تصميم، ملفات، مواقع وحلول تقنية؛ اكتب ما تحتاجه ودعنا نرتب لك الطريق من الطلب إلى التسليم.",
    siteName: "الحلول التقنية الذكية",
    url: "/",
    type: "website",
    locale: "ar_SD",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "عندك فكرة؟ خلّها تصير. اطلب الخدمة الآن",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "عندك فكرة؟ خلّها تصير.",
    description:
      "اطلب خدمة رقمية عن بُعد، وتابع التنفيذ والتسليم عبر WhatsApp.",
    images: ["/opengraph-image.jpg"],
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
