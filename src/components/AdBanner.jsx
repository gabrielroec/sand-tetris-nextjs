import React, { useEffect } from "react";

const AdBanner = ({ adSlot, adFormat = "auto", adStyle = { display: "block" }, className = "" }) => {
  useEffect(() => {
    try {
      // Carrega o script do AdSense se ainda não foi carregado
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log("AdSense não disponível:", error);
    }
  }, []);

  return (
    <div className={`ad-banner ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-3990921548306759"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
