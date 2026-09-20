import "./globals.css";

export const metadata = {
  title: "الحلول التقنية الذكية",
  description: "منصة الخدمات التقنية والرقمية عن بُعد",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
