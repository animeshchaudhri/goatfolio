import React from "react";

function ShutdownVideo() {
  return (
    <div className="absolute inset-0 z-[9999] bg-black">
      <video autoPlay loop className="w-full h-full">
        <source src="/videos/shutdown.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export default ShutdownVideo;
