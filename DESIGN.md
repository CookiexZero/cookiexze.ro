# Reload menu

Implemented on `design-update` using the user's four Persona 3 Reload menu
screenshots as the visual and interaction reference.

## Direction

A fullscreen personal game menu for visitors and friends.
ENERGY 3 / RHYTHM 3 / MOTION 2.

- The composition uses the supplied PRIME artwork, water-like ceiling texture,
  staggered italic menu labels and a white/red selection marker with a pink edge.
- Deep navy replaces the reference's bright blue canvas. Cyan identifies available
  choices; pale surfaces and red identify selection. Dark HUD surfaces protect
  small text over artwork.
- Archivo Black supplies the heavy menu typography. Golos Text supplies readable
  Russian body copy. Barlow Condensed supplies list ordinals. Fonts are self-hosted
  with OFL licenses in `public/fonts`.
- The scene uses the supplied `ПРАЙМ.svg`; Nexus uses the supplied
  `nexus_logo.svg` in the project and social views. PRIME's gradients and shadows
  use the site's cyan `#78ecff` and blue `#135ded`, with a pale `#f3fcff` check,
  directly in `public/images/prime.svg`. Nexus keeps its supplied colors in
  `public/images/nexus-logo.svg`. Live Discord avatars, decorations and banners
  remain in the profile screen. No identity or game assets were fabricated.
- Motion owns timed animation: a full-screen diagonal sweep, menu selection and
  link gestures. CSS contains no keyframes or transition declarations. The
  background takes its final responsive position before it is revealed, avoiding
  concurrent SVG scaling and rotation under the wipe. `MotionConfig` and
  `useReducedMotion` respect the device's reduced-motion setting.
- Russian subtitles beside headings, the side captions, breadcrumb and pale left
  polygon are removed. Background nicknames stay on one line. The profile no
  longer displays a connection/source notice. Menu guide copy follows the user's
  requested replacements, and GitHub's artwork label reads COMMIT. PUSH. REPEAT.
- All scrolling regions share the same cyan scrollbar styling, including detail
  cards, with WebKit pseudo-element fallbacks. Large italic menu labels have extra
  paint-box padding so the gradient does not clip the first/last glyphs.

## Behavior

- Main menu: PROFILE, SOCIAL LINK, PROJECTS, STATUS and GITHUB open separate screens.
- Up/Down selects a menu item with wrapping. Home/End selects the first/last item.
  Enter opens the focused item. Pointer movement previews a menu choice; click
  opens it. Escape or either back control returns to the menu and restores focus.
- Section tabs, footer controls and `[` / `]` switch between content screens.
- URL hashes identify screens and support direct links, reload and browser history.
- Social-list arrows follow actual keyboard focus, separately from pointer
  previews. Keyboard scrolling cannot let a stationary pointer steal selection.
  The right-hand detail action opens the selected service.
- PROJECTS contains Nexus and three native disabled slots marked with crosses.
  Keyboard navigation skips disabled slots. Nexus opens the project site.
- Nexus logos have transparent backing in the social list, detail panel and
  project view. All visitor-facing labels use "Nexus", including image alt text
  and the project action; the existing site/profile URLs stay intact.
- Discord presence, Spotify progress, contribution counts and GitHub events retain
  the existing data hooks. Loading, empty and failure branches remain explicit.
- Content lists scroll inside the screen. Short landscape screens use compact
  layouts; the shortest main-menu layout scrolls its choices into keyboard focus.
- GitHub responses share in-flight requests and a five-minute memory cache.
  Reopening the screen immediately restores available data. Refresh failures keep
  the last good snapshot; failed requests can be retried.

## Performance verification

The local before/after comparison used the same seven navigation actions, starting
at the main menu in a fresh document. A temporary development-only probe sampled
each action for 1.1 seconds, then was removed. The measurement is the first frame
after a route change where the new screen's opacity reaches 0.9. This panel-opacity
measurement excludes the foreground transition wipe.

| Measurement | Before | After |
| --- | --- | --- |
| Incoming panel opacity reaches 0.9 (wipe excluded) | 469.7–495.1 ms | 5.0–10.8 ms |
| Observed inline geometry changes per transition | 172–176 | 0 |
| Requests across two visits to GitHub | 4 | 2 |

The geometry counter watched changes to `left`, `top`, `bottom`, `width`, `height`,
`font-size` and horizontal padding. Final layout still changes once when the scene
changes; those properties are no longer interpolated on every animation frame.

Other changes remove the 130 ms entrance delay, shorten selection feedback to
120 ms, keep social details mounted during selection, and memoize the background
scene. Background type has a fixed, bounded size. The remaining sweep is brief
and uses compositor transforms. GitHub hover feedback
uses translation instead of changing padding. These measurements cover the local
development session.

The transition keeps the original opaque, full-screen cyan sweep in 500 ms.
Its two-position trajectory uses one continuous easing curve, with no midway
keyframe to interrupt its velocity. A noninteractive DOM snapshot preserves the
outgoing screen ahead of the sweep; the incoming screen is revealed only behind
its trailing edge. Modern browsers capture both screens with View Transitions;
Motion animates their complementary diagonal clips on one browser timeline. A
cyan backing surface between the snapshots forms the full-width slider. The
live DOM is never skewed or repainted through an animated mask on this path.
Browsers without View Transitions keep the DOM-snapshot transform fallback.
No per-frame React updates or second React tree are needed. Scroll positions are
preserved in the outgoing snapshot. Navigation/data updates begin immediately.
Focus moves to the new screen after the transition; reduced motion switches
screens immediately. Rapid navigation cancels a previous capture and prevents a
stale update from replacing the latest target.
Desktop/mouse, Enter/Escape, browser Back/Forward, screen-to-screen and mobile
transitions were checked after this visual tuning. The two partial-frame captures
confirm the outgoing and incoming content on their respective sides of the wipe.
Twenty selected-label cases across 1440, 1024, 390 and 320 px widths fit the screen.
Both overflowing social panes were checked for thin cyan scrollbars.

The static water filter is rasterized once to `public/images/water-surface.webp`
(10 KB), retaining its alpha fade; its editable source is
`src/assets/water-surface.svg`. This removes live `feTurbulence` and its CSS mask
from the animation's rendering tree. The supplied background SVG keeps its
theme palette directly in the asset, without CSS filtering or blend modes. The transition implementation
follows the browser snapshot lifecycle described in
[MDN's View Transitions guide](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)
and uses Motion's native animation controls.

### Firefox comparison

The Firefox issue was reproduced in Zen (Firefox 159) at 1904x1034. Each series
warms all five screens, then records ten navigation actions for at least 700 ms
each. The diagnostic code was removed after the comparison.

| Browser / rAF gap | Before | After |
| --- | --- | --- |
| Firefox, 95th percentile | 145.8 ms | 7.8 ms |
| Firefox, maximum | 281.0 ms | 34.7 ms |
| Firefox, gaps above 50 ms | 50 | 0 |
| Chrome 157, 95th percentile | 13.9 ms | 7.7 ms |

The new Firefox transitions finish in 506–534 ms, including snapshot preparation
and the 500 ms sweep. Chrome's final run had one 54.5 ms gap during capture;
these are local rAF samples, not a field FPS or presentation-time guarantee.
Live-DOM clipping and layer promotion were tested separately and did not remove
the Firefox stalls. The browser-snapshot path avoids that rendering work.

## Delivery gate

- PASS, Hard Gate: `astro check` reports zero errors, warnings and hints; production
  build, both cache regression tests and the wipe corner-coverage test
  (`npm test`) and `git diff --check` pass.
  All 42 screen/viewport combinations fit the
  page; content screens do not overlap the footer and all scroll regions have
  usable height. Sizes: 1440x900, 1024x768, 768x1024, 390x844, 320x568, 844x390,
  568x320. These checks include the main menu and all five content screens.
- PASS, Purpose Gate: composition, typography, palette, artwork treatment,
  selection geometry, external arrows and transition purposes are recorded above.
- PASS, Liveliness: the declared dials are reflected in the layered menu scene,
  list/detail screens, contextual guide and full-screen transitions.
- PASS, Craftsmanship: mouse and keyboard selection, Enter, Escape, wrapping,
  Home/End, all tabs, previous/next controls, shortcuts, direct URL reload, browser
  history and the project list were exercised in the local browser. The three
  disabled slots cannot receive focus; Tab moves from Nexus to its project link.
  Twenty rapid arrow-key inputs, Enter/Escape and browser Back/Forward also pass.
  Focus indicators, native controls, accessible names, image dimensions and
  reduced-motion styles are present. No app console errors/warnings were observed.
- PASS, Contrast: muted text on the navy surface is 10.74:1; cyan on deep blue is
  11.60:1; selection red on pale white is 5.10:1; handle text on selection is
  8.89:1. Artwork-facing HUD copy has dark backing surfaces.

### Link verification

All seven web social rows opened their configured GitHub, Discord, Telegram,
Steam, Nexus, Spotify and YouTube addresses. Selecting Discord with the
keyboard made both the detail panel and its action open the Discord profile.
The featured project links to `https://nexus-shiyu.com`.

The existing source, GitHub-event and Spotify-track links retain their previously
verified targets. Email remains `mailto:mail@cookiexzero.ru`; browser security
blocks launching the external mail client, so this target is source-verified.
No email was composed or sent. External-site availability is not guaranteed by
these local navigation checks. API failure/empty states and Motion reduced-motion
handling were inspected in source; live and loading states were also observed.

Lighthouse and field Web Vitals were not measured.
