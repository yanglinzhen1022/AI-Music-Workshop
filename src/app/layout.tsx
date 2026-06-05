import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Music2, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Music Workshop | AI 音乐创作平台",
  description: "全链路 AI 音乐创作平台 - 输入灵感，生成专属歌曲",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
          <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music2 className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Sing AI
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/60 hover:text-white"
              >
                <Globe size={20} />
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="border-t border-white/5 py-8 sm:py-12 bg-surface/30">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="flex items-center gap-2">
                <Music2 className="text-primary" size={20} />
                <span className="font-semibold">AI Music Workshop</span>
              </div>
              <p className="text-xs text-foreground/30">
                © 2024 Sing AI. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-8 text-sm text-foreground/40">
              <a href="#" className="hover:text-primary transition-colors">使用条款</a>
              <a href="#" className="hover:text-primary transition-colors">隐私政策</a>
              <a href="#" className="hover:text-primary transition-colors">关于我们</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
