"use client";

import Script from "next/script";

export default function Analytics() {
  return (
    <>
      {/* Google Analytics */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: 'Sand Tetris - Jogo Online Gratuito',
            page_location: 'https://sandtetris.io',
            custom_map: {
              'custom_parameter_1': 'game_version',
              'custom_parameter_2': 'platform'
            }
          });
        `}
      </Script>

      {/* Structured Data for Game */}
      <Script
        id="structured-data"
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
            gameItem: {
              "@type": "Game",
              name: "Sand Tetris",
              description: "Tetris com física de areia realista",
            },
          }),
        }}
      />
    </>
  );
}
