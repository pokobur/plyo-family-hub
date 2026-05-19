import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import Header from "@/components/layout/Header";
import "./globals.css";

const mplus = M_PLUS_Rounded_1c({
  weight: ['400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-mplus',
});

export const metadata: Metadata = {
  title: "plyo. family hub - 子育て情報と遊びのポータル",
  description: "家族みんなで楽しめるゲームと、育児を楽にする神アイテム・Q&Aが集まるポータルサイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${mplus.variable} antialiased font-sans flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
