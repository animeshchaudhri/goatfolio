"use client";
import React, { useEffect, useState } from "react";

function Iframe({ url }: { url: string }) {
  return (
    <LazyIframe>
      <iframe
        src={url}
        id="isite"
        className="w-full h-full border-0 overflow-hidden"
        title="site"
        style={{ overflow: "hidden", scrollbarWidth: "none", msOverflowStyle: "none" }}
        loading="lazy"
      />
    </LazyIframe>
  );
}

export default Iframe;

function LazyIframe({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return loaded ? <>{children}</> : null;
}
