import {
  siDiscord,
  siGithub,
  siSpotify,
  siSteam,
  siTelegram,
  siYoutube,
} from 'simple-icons';
import type { LinkItem } from '../config';
import { NexusShiyuLogo } from './NexusShiyuLogo';

/** Brand marks come from simple-icons; `mail` is a hand-drawn envelope. */
const brands = {
  github: siGithub,
  discord: siDiscord,
  telegram: siTelegram,
  steam: siSteam,
  spotify: siSpotify,
  youtube: siYoutube,
} as const;

export function BrandIcon({
  name,
  className = 'h-5 w-5',
}: {
  name: LinkItem['icon'];
  className?: string;
}) {
  if (name === 'nexus-shiyu') {
    // A wide two-tone wordmark rather than a glyph, so it ignores `className`
    // and sizes itself to fit the chip.
    return <NexusShiyuLogo className="h-auto w-7" />;
  }

  if (name === 'mail') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
        <path d="m3 7 8.2 5.6a1.5 1.5 0 0 0 1.6 0L21 7" />
      </svg>
    );
  }

  const icon = brands[name];
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

/** Colours without a simple-icons entry. */
const CUSTOM_COLORS: Partial<Record<LinkItem['icon'], string>> = {
  mail: '#71717a',
  'nexus-shiyu': '#E0004D',
};

/** Official brand colour, used for the icon tint on hover. */
export function brandColor(name: LinkItem['icon']): string {
  return CUSTOM_COLORS[name] ?? `#${brands[name as keyof typeof brands].hex}`;
}

/**
 * Icons that carry their own palette. Filling the chip with the brand colour
 * on hover would hide the crimson wordmark against crimson, so those chips
 * keep the pale tint instead.
 */
export function keepsOwnColor(name: LinkItem['icon']): boolean {
  return name === 'nexus-shiyu';
}
