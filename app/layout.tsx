import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Document Editor",
  description: "A4ドキュメント作成・編集アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" style={{ overflow: 'auto', overflowX: 'hidden' }}>
      <body
        className={`${notoSansJP.variable} antialiased`}
        style={{ fontFamily: "'Noto Sans JP', sans-serif", overflow: 'auto', overflowX: 'hidden' }}
      >
        {children}
      </body>
    </html>
  );
}
