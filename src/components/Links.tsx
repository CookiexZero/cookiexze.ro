import { useState } from 'react';
import { links } from '../config';
import { BrandIcon, brandColor, keepsOwnColor } from './Icon';

export function Links() {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {links.map((link) => (
        <li key={link.label}>
          <LinkCard {...link} />
        </li>
      ))}
    </ul>
  );
}

function LinkCard({ icon, label, handle, href }: (typeof links)[number]) {
  const [hovered, setHovered] = useState(false);
  const external = !href.startsWith('mailto:');
  const color = brandColor(icon);
  const filled = hovered && !keepsOwnColor(icon);

  return (
    <a
      href={href}
      {...(external
        ? { target: '_blank', rel: 'noreferrer noopener' }
        : undefined)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        // The brand colour drives the whole pill: a tinted border and a soft
        // coloured glow on hover, mixed against white so it stays light.
        borderColor: hovered
          ? `color-mix(in oklab, ${color} 45%, white)`
          : undefined,
        backgroundColor: hovered
          ? `color-mix(in oklab, ${color} 5%, white)`
          : undefined,
        boxShadow: hovered
          ? `0 6px 20px -8px color-mix(in oklab, ${color} 60%, transparent)`
          : undefined,
      }}
      className="group flex items-center gap-3 rounded-full border border-zinc-200/80 bg-white py-2.5 pr-5 pl-2.5 transition duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
        style={{
          backgroundColor: filled
            ? color
            : `color-mix(in oklab, ${color} 12%, white)`,
          color: filled ? '#ffffff' : color,
        }}
      >
        <BrandIcon name={icon} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-zinc-900">{label}</span>
        <span className="block truncate text-xs text-zinc-400">{handle}</span>
      </span>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5"
        style={hovered ? { color } : undefined}
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </a>
  );
}
