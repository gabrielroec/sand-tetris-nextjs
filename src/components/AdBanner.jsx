import React, { useEffect, useRef, useState } from "react";

const AdBanner = ({ adSlot, adFormat = "auto", adStyle = { display: "block" }, className = "" }) => {
  const adRef = useRef(null);
  const hasLoaded = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Observer para detectar quando o elemento fica visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // TEMPORARIAMENTE DESABILITADO - Aguardando aprovação do Google AdSense
    // O AdSense está em processo de verificação (2-4 semanas)
    // Durante esse período, exibimos placeholders bonitos

    console.log("AdSense em verificação - Exibindo placeholder");

    // TODO: Reativar quando o Google aprovar o site
    // if (!isVisible || hasLoaded.current || !window.adsbygoogle) return;

    // const checkAndLoad = () => {
    //   if (adRef.current) {
    //     const rect = adRef.current.getBoundingClientRect();
    //     if (rect.width > 0 && rect.height > 0) {
    //       try {
    //         const existingAd = adRef.current.querySelector(".adsbygoogle[data-ad-status]");
    //         if (!existingAd) {
    //           const newIns = document.createElement("ins");
    //           newIns.className = "adsbygoogle";
    //           newIns.style.cssText = Object.entries(adStyle)
    //             .map(([key, value]) => `${key}: ${value}`)
    //             .join(";");
    //           newIns.setAttribute("data-ad-client", "ca-pub-3990921548306759");
    //           newIns.setAttribute("data-ad-slot", adSlot);
    //           newIns.setAttribute("data-ad-format", adFormat);
    //           newIns.setAttribute("data-full-width-responsive", "true");
    //           adRef.current.innerHTML = "";
    //           adRef.current.appendChild(newIns);
    //           (window.adsbygoogle = window.adsbygoogle || []).push({});
    //           hasLoaded.current = true;
    //         }
    //       } catch (error) {
    //         console.log("AdSense não disponível:", error);
    //       }
    //     } else {
    //       setTimeout(checkAndLoad, 200);
    //     }
    //   }
    // };
    // const timer = setTimeout(checkAndLoad, 300);
    // return () => clearTimeout(timer);
  }, [isVisible, adSlot, adFormat, adStyle]);

  return (
    <div className={`ad-banner ${className}`} ref={adRef}>
      {/* Placeholder durante verificação do Google */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#4ecdc4",
          fontSize: "14px",
          fontWeight: "bold",
          background: "linear-gradient(145deg, #1a1a2e, #16213e)",
          border: "2px solid #4ecdc4",
          borderRadius: "8px",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <div style={{ fontSize: "24px", marginBottom: "10px" }}>🚀</div>
        <div>Sand Tetris</div>
        <div style={{ fontSize: "10px", color: "#888", marginTop: "5px" }}>Em breve: Anúncios do Google</div>
      </div>
    </div>
  );
};

export default AdBanner;
