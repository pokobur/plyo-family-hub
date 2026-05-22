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
  description: "家族みんなで楽しめるゲームと、育児を楽にするおすすめアイテム・Q&Aが集まるポータルサイトです。",
  openGraph: {
    title: "plyo. family hub - 子育て情報と遊びのポータル",
    description: "育児の悩みを解決する知恵袋や、本当におすすめのアイテムが集まる子育て支援ポータル。",
    url: "https://family.plyo.blog",
    siteName: "plyo. family hub",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "plyo. family hub",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "plyo. family hub - 子育て情報と遊びのポータル",
    description: "育児の悩みを解決する知恵袋や、本当におすすめのアイテムが集まる子育て支援ポータル。",
    images: ["https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80"],
  },
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
