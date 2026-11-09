import { motion, useReducedMotion } from "motion/react";
import { site } from "../config";

export function MenuScene({ mode }: { mode: "menu" | "screen" | "detail" }) {
  const reduced = useReducedMotion();
  const menu = mode === "menu";
  const target = menu ? "menu" : "screen";

  return (
    <div className="scene" aria-hidden="true">
      <div className="ocean-light" />
      <svg
        className="water-surface"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
      >
        <filter id="water">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".009 .05"
            numOctaves="2"
            seed="7"
          />
          <feColorMatrix type="luminanceToAlpha" />
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0 .25 .7 .9" />
          </feComponentTransfer>
        </filter>
        <rect
          width="1200"
          height="300"
          fill="currentColor"
          filter="url(#water)"
        />
      </svg>
      <motion.div
        className="scene-lettering"
        initial={false}
        animate={{
          left: menu ? "var(--lettering-menu-left)" : "50%",
          fontSize: menu ? "var(--lettering-menu-size)" : "20vw",
          color: menu ? "#02112c" : "#61d7ef",
          rotate: menu ? -76 : -65,
          opacity: menu ? 0.9 : 0.08,
        }}
        transition={{ duration: reduced ? 0 : 0.6, ease: "easeInOut" }}
      >
        {site.fallbackName}
      </motion.div>
      <motion.div
        className="scene-portrait"
        initial={false}
        animate={{
          left: `var(--portrait-${target}-left)`,
          width: `var(--portrait-${target}-width)`,
          height: `var(--portrait-${target}-height)`,
          bottom: `var(--portrait-${target}-bottom)`,
          rotate: `var(--portrait-${target}-rotate)`,
          opacity: `var(--portrait-${mode}-opacity)`,
        }}
        transition={{ duration: reduced ? 0 : 0.6, ease: "easeInOut" }}
      >
        <img
          src="/favicon-512.png"
          alt=""
          width="512"
          height="512"
          fetchPriority="high"
        />
      </motion.div>
      <div className="scene-shard shard-one" />
      <div className="scene-shard shard-two" />
      <div className="scene-shard shard-three" />
    </div>
  );
}
