"use client";
import { useEffect, useState } from "react";

export function VisitorCounter() {
  const [count, setCount] = useState("......");

  useEffect(() => {
    fetch("https://api.countapi.xyz/hit/animeshchaudhri/blog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.value !== "number") throw new Error("Invalid counter response");
        setCount(String(d.value).padStart(6, "0"));
      })
      .catch(() => setCount("------"));
  }, []);

  return <span className="counter">{count}</span>;
}
