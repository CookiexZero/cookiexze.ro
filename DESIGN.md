# Reload menu

Implemented on `design-update` using the user's four Persona 3 Reload menu
screenshots as the visual and interaction reference.

## Direction

A fullscreen personal game menu for visitors and friends.
ENERGY 3 / RHYTHM 3 / MOTION 2.

- The composition uses a large illustrated portrait, water-like ceiling texture,
  staggered italic menu labels and a white/red selection marker with a pink edge.
- Deep navy replaces the reference's bright blue canvas. Cyan identifies available
  choices; pale surfaces and red identify selection. Dark HUD surfaces protect
  small text over artwork.
- Archivo Black supplies the heavy menu typography. Golos Text supplies readable
  Russian body copy. Barlow Condensed supplies list ordinals. Fonts are self-hosted
  with OFL licenses in `public/fonts`.
- The illustrated scene uses the existing favicon through CSS compositing. Live
  Discord avatars, decorations and banners remain in the profile screen. No new
  identity, character art, game assets, ranks or statistics were fabricated.
- A short diagonal wipe accompanies scene changes. The portrait changes position
  between the main menu and content screens. There is no ambient animation;
  reduced-motion CSS removes scene movement and the wipe.

## Behavior

- Main menu: PROFILE, SOCIAL LINK, QUEST, STATUS and GITHUB open separate screens.
- Up/Down selects a menu item with wrapping. Home/End selects the first/last item.
  Enter opens the focused item. Pointer movement previews a menu choice; click
  opens it. Escape or either back control returns to the menu and restores focus.
- Section tabs, footer controls and `[` / `]` switch between content screens.
- URL hashes identify screens and support direct links, reload and browser history.
- Social-list arrows follow actual keyboard focus, separately from pointer
  previews. Keyboard scrolling cannot let a stationary pointer steal selection.
  The right-hand detail action opens the selected service.
- Quest selection changes the detail panel. The Nexus Shiyu quest opens the project.
- Discord presence, Spotify progress, contribution counts and GitHub events retain
  the existing data hooks. Loading, empty and failure branches remain explicit.
- Content lists scroll inside the screen. Short landscape screens use compact
  layouts; the shortest main-menu layout scrolls its choices into keyboard focus.

## Delivery gate

- PASS, Hard Gate: `astro check` reports zero errors, warnings and hints; production
  build and `git diff --check` pass. All 42 screen/viewport combinations fit the
  page; content screens do not overlap the footer and all scroll regions have
  usable height. Sizes: 1440x900, 1024x768, 768x1024, 390x844, 320x568, 844x390,
  568x320. These checks include the main menu and all five content screens.
- PASS, Purpose Gate: composition, typography, palette, artwork treatment,
  selection geometry, external arrows and transition purposes are recorded above.
- PASS, Liveliness: the declared dials are reflected in the layered menu scene,
  list/detail screens, contextual guide and full-screen transitions.
- PASS, Craftsmanship: mouse and keyboard selection, Enter, Escape, wrapping,
  Home/End, all tabs, previous/next controls, shortcuts, direct URL reload, browser
  history and all four quest selections were exercised in the local browser.
  Focus indicators, native controls, accessible names, image dimensions and
  reduced-motion styles are present. No app console errors/warnings were observed.
- PASS, Contrast: muted text on the navy surface is 10.74:1; cyan on deep blue is
  11.60:1; selection red on pale white is 5.10:1; handle text on selection is
  8.89:1. Artwork-facing HUD copy has dark backing surfaces.

### Link verification

All seven web social rows opened their configured GitHub, Discord, Telegram,
Steam, Nexus Shiyu, Spotify and YouTube addresses. Selecting Discord with the
keyboard made both the detail panel and its action open the Discord profile.
The featured quest opened `https://nexus-shiyu.com`.

The existing source, GitHub-event and Spotify-track links retain their previously
verified targets. Email remains `mailto:mail@cookiexzero.ru`; browser security
blocks launching the external mail client, so this target is source-verified.
No email was composed or sent. External-site availability is not guaranteed by
these local navigation checks. API failure/empty states and reduced-motion CSS
were inspected in source; live and loading states were also observed at runtime.

Lighthouse and field Web Vitals were not measured.
