/**
 * Discord data helpers.
 *
 * Identity (avatar, banner, decoration, accent colour) comes from the public
 * `dcdn.dstn.to` mirror of Discord's `/users/:id` endpoint — no bot token and
 * no CORS proxy needed, so this works on a fully static deploy. Everything is
 * fetched in the browser at runtime rather than baked in at build time, which
 * is what makes a changed avatar or banner show up without a rebuild.
 *
 * Presence (online status, games, Spotify) comes from Lanyard over a
 * WebSocket, which pushes updates live.
 */

export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  display_name?: string | null;
  discriminator: string;
  avatar: string | null;
  banner: string | null;
  accent_color: number | null;
  banner_color?: string | null;
  bio?: string;
  public_flags?: number;
  avatar_decoration_data?: { asset: string; sku_id?: string } | null;
};

export type DiscordProfile = {
  user: DiscordUser;
  /** From the richer `/profile/:id` endpoint; both fields are often empty. */
  bio: string;
  pronouns: string;
};

const CDN = 'https://cdn.discordapp.com';
const DCDN = 'https://dcdn.dstn.to';

/** Animated assets are stored with an `a_` prefix and must be served as gif. */
const ext = (hash: string) => (hash.startsWith('a_') ? 'gif' : 'png');

export function avatarUrl(user: DiscordUser, size = 256): string {
  if (!user.avatar) {
    // Post-migration accounts bucket by ID, legacy ones by discriminator.
    const index =
      user.discriminator === '0'
        ? Number((BigInt(user.id) >> 22n) % 6n)
        : Number(user.discriminator) % 5;
    return `${CDN}/embed/avatars/${index}.png`;
  }
  return `${CDN}/avatars/${user.id}/${user.avatar}.${ext(user.avatar)}?size=${size}`;
}

export function bannerUrl(user: DiscordUser, size = 1024): string | null {
  if (!user.banner) return null;
  return `${CDN}/banners/${user.id}/${user.banner}.${ext(user.banner)}?size=${size}`;
}

export function decorationUrl(user: DiscordUser): string | null {
  const asset = user.avatar_decoration_data?.asset;
  if (!asset) return null;
  return `${CDN}/avatar-decoration-presets/${asset}.png?size=160&passthrough=true`;
}

/** Discord stores the profile accent as a 24-bit int; CSS wants `#rrggbb`. */
export function accentHex(user: DiscordUser): string | null {
  if (user.banner_color) return user.banner_color;
  if (user.accent_color == null) return null;
  return `#${user.accent_color.toString(16).padStart(6, '0')}`;
}

export function displayName(user: DiscordUser): string {
  return user.global_name || user.display_name || user.username;
}

export async function fetchDiscordProfile(
  id: string,
  signal?: AbortSignal,
): Promise<DiscordProfile> {
  // `cache: 'no-store'` matters here: without it the browser may hand back a
  // stale avatar hash for hours after the user changes their picture.
  const res = await fetch(`${DCDN}/users/${id}`, {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Discord user lookup failed (${res.status})`);
  const user = (await res.json()) as DiscordUser;

  // The richer profile endpoint is best-effort — it returns `{private:...}`
  // for accounts that don't expose a bio, so never let it fail the whole load.
  let bio = user.bio ?? '';
  let pronouns = '';
  try {
    const profileRes = await fetch(`${DCDN}/profile/${id}`, {
      signal,
      cache: 'no-store',
    });
    if (profileRes.ok) {
      const profile = (await profileRes.json()) as {
        user_profile?: { bio?: string; pronouns?: string };
      };
      bio = profile.user_profile?.bio || bio;
      pronouns = profile.user_profile?.pronouns || '';
    }
  } catch {
    /* ignore — bio and pronouns are optional */
  }

  return { user, bio, pronouns };
}

/* ------------------------------------------------------------------ */
/* Lanyard presence                                                     */
/* ------------------------------------------------------------------ */

export type LanyardActivity = {
  id: string;
  name: string;
  type: number;
  state?: string;
  details?: string;
  application_id?: string;
  timestamps?: { start?: number; end?: number };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  emoji?: { id?: string; name: string; animated?: boolean };
};

export type LanyardData = {
  discord_user: DiscordUser;
  discord_status: 'online' | 'idle' | 'dnd' | 'offline';
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: {
    track_id: string;
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps: { start: number; end: number };
  } | null;
  active_on_discord_web: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
};

/** Rich-presence images arrive in several encodings; normalise them to a URL. */
export function activityImageUrl(
  activity: LanyardActivity,
  key: 'large_image' | 'small_image' = 'large_image',
): string | null {
  const image = activity.assets?.[key];
  if (!image) return null;
  if (image.startsWith('mp:')) {
    // Everything `mp:`-prefixed is a Discord media-proxy path, including
    // `mp:external/<hash>/https/host/path`. It has to stay proxied: the origin
    // behind an external asset usually rejects hotlinking (PreMiD returns 401).
    return `https://media.discordapp.net/${image.slice(3)}`;
  }
  if (image.startsWith('spotify:')) {
    return `https://i.scdn.co/image/${image.slice('spotify:'.length)}`;
  }
  if (activity.application_id) {
    return `${CDN}/app-assets/${activity.application_id}/${image}.png`;
  }
  return null;
}

export const statusLabel: Record<LanyardData['discord_status'], string> = {
  online: 'В сети',
  idle: 'Не активен',
  dnd: 'Не беспокоить',
  offline: 'Не в сети',
};

export const statusColor: Record<LanyardData['discord_status'], string> = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-400',
  dnd: 'bg-rose-500',
  offline: 'bg-zinc-400',
};

/** Discord activity types: 0 playing, 1 streaming, 2 listening, 3 watching,
 *  4 custom status, 5 competing. */
export const ACTIVITY_CUSTOM_STATUS = 4;
export const ACTIVITY_LISTENING = 2;
