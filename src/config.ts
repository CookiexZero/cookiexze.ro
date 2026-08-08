/**
 * Site configuration.
 *
 * The Discord ID and GitHub username come from `.env` (see `.env.example`) so
 * the same build can be pointed at a different profile without code changes.
 */

export const DISCORD_ID: string =
  import.meta.env.PUBLIC_DISCORD_ID ?? '563801028139679755';

export const GITHUB_USER: string =
  import.meta.env.PUBLIC_GITHUB_USER ?? 'cookiexzero';

export const EMAIL: string =
  import.meta.env.PUBLIC_EMAIL ?? 'mail@cookiexzero.ru';

export const site = {
  /** Shown while the Discord profile is still loading, and in <title>. */
  fallbackName: 'cookiexzero',
  tagline: 'frontend • backend • всё, что компилируется',
  location: 'Tokyo, Japan',
  /** Falls back to the Discord "About Me" when that is empty. */
  bio: '',
  /** Source of this page, linked from the footer. */
  repo: 'https://github.com/CookiexZero/cookiexze.ro',
};

/** Static "what I'm up to" list — the part Discord and GitHub can't know. */
export type DoingItem = {
  title: string;
  description: string;
  /** Either an emoji or a named logo component; `logo` wins when both are set. */
  emoji?: string;
  logo?: 'nexus-shiyu';
};

export const doing: DoingItem[] = [
  {
    logo: 'nexus-shiyu',
    title: 'Разрабатываю Nexus Shiyu',
    description: 'Участник команды и любимого комьюнити.',
  },
  {
    emoji: '📚',
    title: 'Изучаю TypeScript',
    description: 'Делаю пэт-проекты и все такое.',
  },
  {
    emoji: '🎧',
    title: 'Люблю музыку',
    description: 'Слушаю электронщину, EDM, hyperpop и J-pop.',
  },
  {
    emoji: '🎰',
    title: 'Zenless Zone Zero',
    description: 'Любимая игра и лучшее казино.',
  },
];

export type LinkItem = {
  /** simple-icons slug, or `mail` for the built-in envelope icon. */
  icon:
    | 'github'
    | 'discord'
    | 'telegram'
    | 'steam'
    | 'spotify'
    | 'youtube'
    | 'nexus-shiyu'
    | 'mail';
  label: string;
  handle: string;
  href: string;
};

export const links: LinkItem[] = [
  {
    icon: 'github',
    label: 'GitHub',
    handle: `${GITHUB_USER}`,
    href: `https://github.com/${GITHUB_USER}`,
  },
  {
    icon: 'discord',
    label: 'Discord',
    handle: 'cookiexzero',
    href: `https://discord.com/users/${DISCORD_ID}`,
  },
  {
    icon: 'telegram',
    label: 'Telegram',
    handle: 'truecookiexzerohome',
    href: 'https://t.me/truecookiexzerohome',
  },
  {
    icon: 'steam',
    label: 'Steam',
    handle: 'cookiexzero | кукикс',
    href: 'https://steamcommunity.com/profiles/76561199237102612/',
  },
  {
    icon: 'nexus-shiyu',
    label: 'Nexus Shiyu',
    handle: 'cookiexzero',
    href: 'https://nexus-shiyu.com/users/profile/cmr97xjsa0000j6vtg228hw25',
  },
  {
    icon: 'spotify',
    label: 'Spotify',
    handle: 'cookiexzero',
    href: 'https://open.spotify.com/user/31lheqhsbs6ese5oz5rynczwmwse',
  },
  {
    icon: 'youtube',
    label: 'YouTube',
    handle: 'cookiexzero',
    href: 'https://youtube.com/@cookiexzero',
  },
  {
    icon: 'mail',
    label: 'Email',
    handle: EMAIL,
    href: `mailto:${EMAIL}`,
  },
];
