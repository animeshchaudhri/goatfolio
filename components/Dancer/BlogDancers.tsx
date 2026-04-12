"use client";
import { useRef } from "react";
import { useChromakey } from "./useChromakey";

const W = 160;
const H = 213;

function CornerDancer({ side }: { side: "left" | "right" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useChromakey(videoRef, canvasRef, true);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        [side]: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <video
        ref={videoRef}
        src="/videos/Courage.mp4"
        loop
        muted
        playsInline
        style={{ display: "none" }}
      />
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "block" }}
      />
    </div>
  );
}

export default function BlogDancers() {
  return <CornerDancer side="right" />;
}
