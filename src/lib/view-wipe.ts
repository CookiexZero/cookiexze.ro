import { animate } from "motion/mini";
import type { GroupAnimationWithThen } from "motion";
import { wipeClips, type wipeGeometry } from "./page-transition";

/** Animate two browser-owned snapshots, keeping live content out of the mask. */
export function startViewWipe(
  update: () => void,
  geometry: ReturnType<typeof wipeGeometry>,
) {
  const transition = document.startViewTransition(update);
  const animations: ReturnType<typeof animate>[] = [];
  let cancelled = false;
  const from = wipeClips(-geometry.travel, geometry.width, geometry.overhang);
  const to = wipeClips(geometry.travel, geometry.width, geometry.overhang);

  const ready = transition.ready.then(() => {
    if (cancelled) return;
    const startTime = document.timeline.currentTime as number;
    for (const [layer, key] of [
      ["old", "outgoing"],
      ["new", "incoming"],
    ] as const) {
      const options = {
        pseudoElement: `::view-transition-${layer}(page)`,
        duration: 0.5,
        ease: [0.45, 0, 0.2, 1] as const,
      };
      // Mini returns a group; its public function type exposes only controls.
      const animation = animate(
        document.documentElement,
        {
          clipPath: [from[key], to[key]],
        },
        options,
      ) as GroupAnimationWithThen;
      // Both edges use precisely the same browser timeline, including Firefox.
      animation.animations.forEach((layer) => {
        layer.startTime = startTime;
      });
      animations.push(animation);
    }
    // Motion retains the final pseudo-element styles. Release those effects at
    // the end so the browser can destroy its snapshot tree and restore input.
    void Promise.all(animations.map((animation) => animation.finished)).then(
      () => {
        animations.forEach((animation) => animation.cancel());
        transition.skipTransition();
      },
    );
  });
  // Skipping a transition rejects ready; its DOM update still runs normally.
  void ready.catch(() => transition.skipTransition());
  return {
    finished: transition.finished,
    cancel() {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
      transition.skipTransition();
    },
  };
}
