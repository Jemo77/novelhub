"use client";

interface AdIframeProps {
  adId: string;
  baseUrl?: string;
  className?: string;
}

export default function AdIframe({ adId, baseUrl = "https://a-ads.com", className = "" }: AdIframeProps) {
  const safeSrc = baseUrl.replace(/\/$/, "") + "/" + adId;

  return (
    <div className={"overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 shadow-sm " + className}>
      <iframe
        title={"Publicidad " + adId}
        src={safeSrc}
        className="h-24 w-full sm:h-28"
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
