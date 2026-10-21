"use client";
import React, { useEffect, useId, useState } from "react";

// Win7 CPU Meter gadget: glossy black body, big CPU dial + small memory dial with
// red needles and digital readouts.

const SWEEP = 130; // degrees either side of straight up

function useLoad(preview?: boolean) {
  const [load, setLoad] = useState({ cpu: preview ? 18 : 12, mem: preview ? 46 : 41 });
  useEffect(() => {
    if (preview) return;
    const t = setInterval(() => {
      setLoad(({ cpu, mem }) => {
        const spike = Math.random() < 0.08 ? 35 + Math.random() * 40 : 0;
        const nextCpu = spike || cpu + (Math.random() - 0.55) * 12;
        const nextMem = mem + (Math.random() - 0.5) * 2.5;
        return {
          cpu: Math.round(Math.min(100, Math.max(2, nextCpu))),
          mem: Math.round(Math.min(78, Math.max(32, nextMem))),
        };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [preview]);
  return load;
}

function Dial({ id, cx, cy, r, value }: { id: string; cx: number; cy: number; r: number; value: number }) {
  const angle = -SWEEP + (value / 100) * SWEEP * 2;
  const ticks = [];
  for (let v = 0; v <= 100; v += 5) {
    const major = v % 10 === 0;
    const a = ((-SWEEP + (v / 100) * SWEEP * 2) * Math.PI) / 180;
    const r1 = r - 5 - (major ? r * 0.16 : r * 0.08);
    const r2 = r - 5;
    ticks.push(
      <line
        key={v}
        x1={cx + r1 * Math.sin(a)} y1={cy - r1 * Math.cos(a)}
        x2={cx + r2 * Math.sin(a)} y2={cy - r2 * Math.cos(a)}
        stroke={v >= 80 ? "#ff4b2b" : major ? "#fff" : "#a9a9a9"}
        strokeWidth={major ? 1.6 : 0.9}
      />
    );
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}bezel)`} stroke="#111" strokeWidth=".8" />
      <circle cx={cx} cy={cy} r={r - 3.5} fill={`url(#${id}dial)`} />
      {ticks}
      <g style={{
        transform: `rotate(${angle}deg)`, transformOrigin: `${cx}px ${cy}px`,
        transition: "transform .9s cubic-bezier(.35,1.35,.6,1)",
      }}>
        <path
          d={`M${cx - 1.6} ${cy + r * 0.18} L${cx} ${cy - (r - 8)} L${cx + 1.6} ${cy + r * 0.18} Z`}
          fill="#ff3b1d" style={{ filter: "drop-shadow(0 0 1.5px rgba(255,80,40,.8))" }}
        />
      </g>
      <circle cx={cx} cy={cy} r={r * 0.15} fill={`url(#${id}cap)`} stroke="#222" strokeWidth=".6" />
    </g>
  );
}

function Readout({ x, y, w, value }: { x: number; y: number; w: number; value: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="13" rx="2" fill="#050505" stroke="#5c5c5c" strokeWidth=".8" />
      <text
        x={x + w / 2} y={y + 10} textAnchor="middle" fill="#f2f2f2"
        style={{ font: '600 9.5px "Segoe UI", "Noto Sans", sans-serif' }}
      >
        {value}%
      </text>
    </g>
  );
}

export default function CpuMeter({ preview }: { preview?: boolean }) {
  const id = useId().replace(/:/g, "");
  const { cpu, mem } = useLoad(preview);
  return (
    <svg width="158" height="100" viewBox="0 0 158 100" style={{ display: "block", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.6))" }}>
      <defs>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d5d5d" />
          <stop offset=".46" stopColor="#1e1e1e" />
          <stop offset=".54" stopColor="#050505" />
          <stop offset="1" stopColor="#262626" />
        </linearGradient>
        <linearGradient id={`${id}bezel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset=".5" stopColor="#9b9b9b" />
          <stop offset="1" stopColor="#e2e2e2" />
        </linearGradient>
        <radialGradient id={`${id}dial`} cx=".5" cy=".35" r=".7">
          <stop offset="0" stopColor="#404040" />
          <stop offset="1" stopColor="#020202" />
        </radialGradient>
        <radialGradient id={`${id}cap`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#6e6e6e" />
        </radialGradient>
        <linearGradient id={`${id}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".32" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x=".5" y=".5" width="157" height="99" rx="11" fill={`url(#${id}body)`} stroke="#0d0d0d" />
      <rect x="1.5" y="1.5" width="155" height="97" rx="10" fill="none" stroke="rgba(255,255,255,.22)" />
      <Dial id={id} cx={55} cy={50} r={39} value={cpu} />
      <Dial id={id} cx={122} cy={36} r={25} value={mem} />
      <Readout x={39} y={78} w={32} value={cpu} />
      <Readout x={108} y={64} w={28} value={mem} />
      <path d="M12 2 H146 A10 10 0 0 1 156 12 V40 Q79 22 2 40 V12 A10 10 0 0 1 12 2 Z" fill={`url(#${id}gloss)`} />
    </svg>
  );
}
