"use client";
import React, { useEffect, useState } from "react";

function Iframe({ url }: { url: string }) {
  return (
    <>
      <LazyComponent show={true}>
        <iframe
          src={url}
          id="isite"
          className="w-full h-full border-0 overflow-hidden "
          title="site"
          style={{
            overflow: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          loading="lazy"
        ></iframe>
      </LazyComponent>
    </>
  );
}

export default Iframe;

const LazyComponent: React.FC<{ show: boolean; children: unknown }> = ({
  show,
  children,
}) => {
  const [loaded, setLoad] = useState(false);

  useEffect(() => {
    if (show && !loaded) setLoad(true);
  }, [show, loaded]);

  return show || loaded ? <>{children}</> : null;
};
