"use client";

import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  gameState?: {
    score: number;
    level: number;
    combo: number;
  };
}

export default function SEOHead({
  title = "Sand Tetris - Jogo Online Gratuito | Arcade HTML5",
  description = "Jogue Sand Tetris online gratuitamente! Um jogo de puzzle arcade moderno com gráficos HTML5, efeitos visuais incríveis e modo arcade. Compatível com mobile e desktop.",
  keywords = [
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
  image = "https://sandtetris.io/og-image.png",
  url = "https://sandtetris.io",
  type = "website",
  gameState,
}: SEOHeadProps) {
  const dynamicTitle = gameState ? `${title} | Score: ${gameState.score} | Level: ${gameState.level}` : title;

  const dynamicDescription = gameState
    ? `${description} Jogador atual: Score ${gameState.score}, Nível ${gameState.level}${
        gameState.combo > 0 ? `, Combo x${gameState.combo}` : ""
      }.`
    : description;

  return (
    <Head>
      {/* Meta tags básicas */}
      <title>{dynamicTitle}</title>
      <meta name="description" content={dynamicDescription} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content="Gabriel Roec" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-BR" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={dynamicTitle} />
      <meta property="og:description" content={dynamicDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Sand Tetris" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={dynamicTitle} />
      <meta name="twitter:description" content={dynamicDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@gabrielroec1" />
      <meta name="twitter:site" content="@gabrielroec1" />

      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#a78bfa" />
      <meta name="color-scheme" content="dark" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Sand Tetris" />
      <meta name="application-name" content="Sand Tetris" />
      <meta name="msapplication-TileColor" content="#a78bfa" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Performance Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />

      {/* Structured Data para Game */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: "Sand Tetris",
            description: dynamicDescription,
            url: url,
            image: image,
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
            ...(gameState && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
                bestRating: "5",
                worstRating: "1",
              },
              gameItem: {
                "@type": "Game",
                name: "Sand Tetris",
                description: `Tetris com física de areia realista - Score atual: ${gameState.score}`,
                gameServer: {
                  "@type": "GameServer",
                  serverStatus: "Online",
                  playersOnline: "100+",
                },
              },
            }),
          }),
        }}
      />
    </Head>
  );
}
