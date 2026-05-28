import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/shared/MobileNav";
import "./globals.css";

const mplus = M_PLUS_Rounded_1c({
  weight: ['400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-mplus',
});

export const metadata: Metadata = {
  title: "plyo. family hug - 子育て情報と遊びのポータル",
  description: "家族みんなで楽しめるゲームと、育児を楽にするおすすめアイテム・Q&Aが集まるポータルサイトです。",
  openGraph: {
    title: "plyo. family hug - 子育て情報と遊びのポータル",
    description: "育児の悩みを解決する知恵袋や、本当におすすめのアイテムが集まる子育て支援ポータル。",
    url: "https://family-hug.plyo.blog",
    siteName: "plyo. family hug",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "plyo. family hug",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "plyo. family hug - 子育て情報と遊びのポータル",
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
      <body className={`${mplus.variable} antialiased font-sans`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-8 pb-20 md:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
