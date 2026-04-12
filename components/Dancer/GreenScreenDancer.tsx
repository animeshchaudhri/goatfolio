"use client";
import React, { useEffect, useRef, useState } from "react";
import { useChromakey } from "./useChromakey";

const W = 480;
const H = 640;

export default function GreenScreenDancer({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useChromakey(videoRef, canvasRef, false);

  const [pos, setPos] = useState(() => ({
    x: window.innerWidth / 2 - W / 2,
    y: window.innerHeight / 2 - H / 2,
  }));
  const dragging = useRef(false);
  const hasMoved = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const startDrag = (clientX: number, clientY: number) => {
    dragging.current = true;
    hasMoved.current = false;
    dragOffset.current = { x: clientX - pos.x, y: clientY - pos.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      hasMoved.current = true;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      hasMoved.current = true;
      const t = e.touches[0];
      setPos({ x: t.clientX - dragOffset.current.x, y: t.clientY - dragOffset.current.y });
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 99999,
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      onMouseDown={(e) => { startDrag(e.clientX, e.clientY); e.preventDefault(); }}
      onMouseUp={() => { if (!hasMoved.current) onClose(); }}
      onTouchStart={(e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
      onTouchEnd={() => { if (!hasMoved.current) onClose(); }}
    >
      <video
        ref={videoRef}
        src="/videos/Courage.mp4"
        loop
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
