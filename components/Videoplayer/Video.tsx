import React from "react";

function Vid({ url }: { url: string }) {
  return (
    <>
      <video autoPlay loop className="object-cover w-full">
        <source src={url} type="video/mp4" />
      </video>
    </>
  );
}

export default Vid;
