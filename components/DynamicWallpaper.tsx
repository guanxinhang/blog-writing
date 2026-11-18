"use client";

import { useEffect } from "react";

// 确定性伪随机，避免 SSR 与客户端不一致
const STARS = Array.from({ length: 55 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 62,
  size: (i % 3) + 1,
  delay: ((i * 0.7) % 4).toFixed(1),
  dur: (2.5 + (i % 4)).toFixed(1),
}));

const FIREFLIES = [
  { left: 12, top: 72, delay: 0, dur: 13 },
  { left: 28, top: 84, delay: 2, dur: 15 },
  { left: 48, top: 76, delay: 4, dur: 12 },
  { left: 66, top: 88, delay: 1, dur: 16 },
  { left: 82, top: 79, delay: 3, dur: 14 },
  { left: 38, top: 66, delay: 5, dur: 13 },
];

// 光点粒子（跟随人物，底部区域）
const SPARKLE_COLORS = [
  { bg: "#ff8fb8", glow: "rgba(255,143,184,0.9)" },
  { bg: "#c9a6f5", glow: "rgba(201,166,245,0.9)" },
  { bg: "#ffffff", glow: "rgba(255,255,255,0.85)" },
];

const SPARKLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 43 + 7) % 100,
  top: 56 + ((i * 29 + 11) % 41),
  size: (i % 2) + 2,
  delay: ((i * 0.8) % 5).toFixed(1),
  dur: (6 + (i % 5)).toFixed(1),
  hue: i % 3,
}));

export default function DynamicWallpaper() {
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      let t = "day";
      if (h >= 5 && h < 7) t = "dawn";
      else if (h >= 7 && h < 10) t = "morning";
      else if (h >= 10 && h < 16) t = "day";
      else if (h >= 16 && h < 19) t = "dusk";
      else t = "night";
      document.documentElement.setAttribute("data-time", t);
    };
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="char-layer" aria-hidden="true">
        <img className="char-img" src="/qianxiao.jpg" alt="" />
        <div className="char-sheen" />
        <div className="sparkles">
          {SPARKLES.map((s, i) => {
            const c = SPARKLE_COLORS[s.hue];
            return (
              <span
                key={i}
                className="sparkle"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: s.size,
                  height: s.size,
                  background: c.bg,
                  boxShadow: `0 0 ${s.size + 5}px ${s.size}px ${c.glow}`,
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${s.dur}s`,
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="wallpaper" aria-hidden="true">
        <div className="shade" />
      <div className="stars">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>
      <div className="fireflies">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="firefly"
            style={{
              left: `${f.left}%`,
              top: `${f.top}%`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.dur}s`,
            }}
          />
        ))}
      </div>
      </div>
    </>
  );
}
