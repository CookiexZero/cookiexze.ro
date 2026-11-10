import { memo } from "react";
import { site } from "../config";

export const MenuScene = memo(function MenuScene({
  mode,
}: {
  mode: "menu" | "screen" | "detail";
}) {
  return (
    <div className={`scene scene--${mode}`} aria-hidden="true">
      <div className="ocean-light" />
      <img
        className="water-surface"
        src="/images/water-surface.webp"
        width="1600"
        height="400"
        alt=""
        fetchPriority="high"
      />
      <div className="scene-lettering">{site.fallbackName}</div>
      <div className="scene-portrait">
        <img
          src="/images/prime.svg"
          alt=""
          width="828"
          height="708"
          fetchPriority="high"
        />
      </div>
      <div className="scene-shard shard-one" />
      <div className="scene-shard shard-two" />
      <div className="scene-shard shard-three" />
    </div>
  );
});
