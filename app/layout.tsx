import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "친바 - 시간 조율 서비스",
  description: "팀원들과 함께 가능한 시간을 찾아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
