# cookiexze.ro

Personal page — Astro + React + Tailwind, light theme. The avatar, banner,
profile accent, avatar decoration and online status all come from Discord at
runtime, so changing them in Discord updates the site with no rebuild.

## Setup

```sh
npm install
cp .env.example .env   # then set your own IDs
npm run dev
```

| Variable             | Purpose                                                             |
| :------------------- | :------------------------------------------------------------------ |
| `PUBLIC_DISCORD_ID`  | Your Discord user ID (Developer Mode → right-click yourself → Copy User ID) |
| `PUBLIC_GITHUB_USER` | GitHub username for the public activity feed                        |

Both are `PUBLIC_` because the browser does the fetching; neither is a secret.

Everything else — bio, location, the "what I'm up to" list and the links — lives
in [`src/config.ts`](src/config.ts).

## Where the data comes from

| Data                                   | Source                                | Notes                                                    |
| :------------------------------------- | :------------------------------------ | :------------------------------------------------------- |
| Avatar, banner, accent, decoration, bio | `dcdn.dstn.to` (public Discord mirror) | No bot token, CORS-open. Re-fetched every 60s and on tab focus. |
| Online status, games, Spotify           | [Lanyard](https://github.com/Phineas/lanyard) WebSocket | Pushes live updates.                                     |
| Recent commits, PRs, stars              | GitHub public events API              | Unauthenticated, 60 req/hour per IP.                     |

**Presence requires Lanyard.** Join [discord.gg/lanyard](https://discord.gg/lanyard)
with the account in `PUBLIC_DISCORD_ID`, otherwise the "Сейчас" block shows a
hint instead of a status. Avatar and banner work regardless — they don't go
through Lanyard.

## Commands

| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `npm run dev`     | Dev server on `localhost:4321`             |
| `npm run build`   | Static build to `./dist/`                  |
| `npm run preview` | Preview the build locally                  |
| `npx astro check` | Typecheck `.astro` and `.tsx` files        |

Output is a fully static site — deploy `dist/` anywhere.
