import assert from "node:assert/strict";
import { test } from "node:test";
import {
  wipeGeometry,
  wipeClips,
  WIPE_SKEW,
} from "../src/lib/page-transition.ts";

test("diagonal wipe starts and finishes outside every viewport corner", () => {
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [568, 320],
    [320, 2400],
  ]) {
    const { travel, overhang } = wipeGeometry(width, height);
    const slope = Math.tan((WIPE_SKEW * Math.PI) / 180);
    for (const y of [0, height]) {
      const diagonal = (y - height / 2) * slope;
      assert.ok(
        -travel + width + diagonal < 0,
        "first frame fully exposes the outgoing page",
      );
      assert.ok(
        travel + diagonal > width,
        "last frame fully reveals the incoming page",
      );
      for (const x of [-travel, -width / 2, 0, width / 2, travel]) {
        const clips = wipeClips(x, width, overhang);
        const points = clips.incoming.match(
          /polygon\(0 0, ([\d.e+-]+)px 0, ([\d.e+-]+)px 100%, 0 100%\)/,
        );
        assert.ok(points);
        const boundary = Number(points[y === 0 ? 1 : 2]);
        assert.ok(
          Math.abs(boundary - (x + diagonal)) < 0.001,
          "the reveal edge matches the slider's skew at both viewport corners",
        );
        const outgoing = clips.outgoing.match(
          /polygon\(([\d.e+-]+)px 0, 100% 0, 100% 100%, ([\d.e+-]+)px 100%\)/,
        );
        assert.ok(outgoing);
        assert.ok(
          Math.abs(Number(outgoing[y === 0 ? 1 : 2]) - boundary - width) <
            0.001,
          "the cyan region between snapshots retains the full slider width",
        );
      }
    }
  }
});
