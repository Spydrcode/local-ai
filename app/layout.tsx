import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Forecasta AI | Business Intelligence Platform",
  description: "Instant AI-powered business intelligence for any website. Get strategic insights, competitor analysis, content calendars, and performance optimization in seconds.",
  keywords: ["business intelligence", "AI analysis", "competitor research", "content marketing", "website optimization"],
  authors: [{ name: "Forecasta AI Team" }],
  creator: "Forecasta AI",
  publisher: "Forecasta AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://forecasta-ai.vercel.app',
    title: 'Forecasta AI | Business Intelligence Platform',
    description: 'Instant AI-powered business intelligence for any website. Get strategic insights, competitor analysis, and performance optimization.',
    siteName: 'Forecasta AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forecasta AI | Business Intelligence Platform',
    description: 'Instant AI-powered business intelligence for any website.',
    creator: '@forecastaai',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-950 scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300`}>
        <div className="relative min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
