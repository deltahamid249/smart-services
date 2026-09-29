import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function TrackingDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}