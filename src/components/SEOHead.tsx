import { useEffect } from "react";

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

  useEffect(() => {
    // Atualiza o título dinamicamente
    document.title = dynamicTitle;

    // Atualiza meta tags dinamicamente
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Atualiza meta tags básicas
    updateMetaTag("description", dynamicDescription);
    updateMetaTag("keywords", keywords.join(", "));
    updateMetaTag("author", "Gabriel Roec");
    updateMetaTag("robots", "index, follow");
    updateMetaTag("language", "pt-BR");
    updateMetaTag("revisit-after", "7 days");
    updateMetaTag("distribution", "global");
    updateMetaTag("rating", "general");

    // Atualiza Open Graph
    updatePropertyMetaTag("og:title", dynamicTitle);
    updatePropertyMetaTag("og:description", dynamicDescription);
    updatePropertyMetaTag("og:image", image);
    updatePropertyMetaTag("og:url", url);
    updatePropertyMetaTag("og:type", type);
    updatePropertyMetaTag("og:site_name", "Sand Tetris");
    updatePropertyMetaTag("og:locale", "pt_BR");

    // Atualiza Twitter Card
    updatePropertyMetaTag("twitter:card", "summary_large_image");
    updatePropertyMetaTag("twitter:title", dynamicTitle);
    updatePropertyMetaTag("twitter:description", dynamicDescription);
    updatePropertyMetaTag("twitter:image", image);
    updatePropertyMetaTag("twitter:creator", "@gabrielroec1");
    updatePropertyMetaTag("twitter:site", "@gabrielroec1");

    // Atualiza canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Atualiza structured data
    const structuredData = {
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
    };

    // Remove structured data anterior se existir
    const existingScript = document.querySelector("script[data-seo-structured]");
    if (existingScript) {
      existingScript.remove();
    }

    // Adiciona novo structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-structured", "true");
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [dynamicTitle, dynamicDescription, keywords, image, url, type, gameState]);

  return null;
}
