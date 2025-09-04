import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sand Tetris - Jogo Online Gratuito | Arcade HTML5",
    template: "%s | Sand Tetris",
  },
  description:
    "Jogue Sand Tetris online gratuitamente! Um jogo de puzzle arcade moderno com gráficos HTML5, efeitos visuais incríveis e modo arcade. Compatível com mobile e desktop.",
  keywords: [
    "tetris",
    "jogo online",
    "puzzle game",
    "arcade",
    "html5 game",
    "jogo gratuito",
    "sand tetris",
    "jogo de blocos",
    "mobile game",
    "desktop game",
    "jogo de puzzle",
    "arcade game",
    "jogo brasileiro",
    "tetris online",
  ],
  authors: [{ name: "Gabriel Roec", url: "https://github.com/gabrielroec1" }],
  creator: "Gabriel Roec",
  publisher: "Sand Tetris",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sandtetris.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sand Tetris - Jogo Online Gratuito | Arcade HTML5",
    description:
      "Jogue Sand Tetris online gratuitamente! Um jogo de puzzle arcade moderno com gráficos HTML5, efeitos visuais incríveis e modo arcade. Compatível com mobile e desktop.",
    url: "https://sandtetris.io",
    siteName: "Sand Tetris",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sand Tetris - Jogo Online Gratuito",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sand Tetris - Jogo Online Gratuito | Arcade HTML5",
    description:
      "Jogue Sand Tetris online gratuitamente! Um jogo de puzzle arcade moderno com gráficos HTML5, efeitos visuais incríveis e modo arcade.",
    images: ["/og-image.png"],
    creator: "@gabrielroec1",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "games",
  classification: "Arcade Game",
  other: {
    "theme-color": "#a78bfa",
    "color-scheme": "dark",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Sand Tetris",
    "application-name": "Sand Tetris",
    "msapplication-TileColor": "#a78bfa",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#a78bfa" />
        <meta name="color-scheme" content="dark" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sand Tetris" />
        <meta name="application-name" content="Sand Tetris" />
        <meta name="msapplication-TileColor" content="#a78bfa" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              name: "Sand Tetris",
              description: "Jogo de puzzle arcade moderno com gráficos HTML5 e efeitos visuais incríveis",
              url: "https://sandtetris.io",
              image: "https://sandtetris.io/og-image.png",
              genre: ["Puzzle", "Arcade", "Strategy"],
              gamePlatform: ["Web Browser", "Mobile", "Desktop"],
              applicationCategory: "Game",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
              },
              author: {
                "@type": "Person",
                name: "Gabriel Roec",
                url: "https://github.com/gabrielroec1",
              },
              publisher: {
                "@type": "Organization",
                name: "Sand Tetris",
                url: "https://sandtetris.io",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
                bestRating: "5",
                worstRating: "1",
              },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
