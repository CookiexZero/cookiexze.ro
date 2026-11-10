/** Supplied Nexus artwork, cached as an image rather than duplicating SVG filters. */
export function NexusShiyuLogo({
  className = "h-7 w-auto",
  title = "Nexus",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <img
      src="/images/nexus-logo.svg"
      width="787"
      height="486"
      alt={title}
      className={className}
      decoding="async"
    />
  );
}
