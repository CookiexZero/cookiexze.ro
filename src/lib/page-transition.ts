export const WIPE_SKEW = -18;

export function wipeTransform(x: number, skew = WIPE_SKEW) {
  return `translate3d(${x}px, 0, 0) skewX(${skew}deg)`;
}

export function wipeClips(x: number, width: number, overhang: number) {
  return {
    incoming: `polygon(0 0, ${x + overhang}px 0, ${x - overhang}px 100%, 0 100%)`,
    outgoing: `polygon(${x + width + overhang}px 0, 100% 0, 100% 100%, ${x + width - overhang}px 100%)`,
  };
}

export function wipeGeometry(width: number, height: number) {
  const overhang =
    (height * Math.tan((Math.abs(WIPE_SKEW) * Math.PI) / 180)) / 2;
  const travel = width + overhang + 2;
  return { width, overhang, span: 2 * travel, travel };
}

/** A visual snapshot only: no second React tree, subscriptions or event handlers. */
export function snapshotPage(source: HTMLElement, host: HTMLElement) {
  const clone = source.cloneNode(true) as HTMLElement;
  const moving =
    ".scene-portrait, .scene-lettering, .main-menu, .section-screen, .menu-option, .social-option, .github-event";
  const originals = source.querySelectorAll<HTMLElement>(moving);
  clone.querySelectorAll<HTMLElement>(moving).forEach((node, index) => {
    const style = getComputedStyle(originals[index]!);
    node.style.transform = style.transform;
    node.style.opacity = style.opacity;
    node.style.visibility = style.visibility;
  });

  // Preserve local SVG filters without duplicating IDs in the live document.
  const ids = new Map<string, string>();
  clone.querySelectorAll("[id]").forEach((node) => {
    const id = node.id;
    const copyId = `outgoing-${id}`;
    ids.set(id, copyId);
    node.id = copyId;
  });
  clone.querySelectorAll("*").forEach((node) => {
    for (const attribute of [...node.attributes]) {
      let value = attribute.value.replace(/url\(#([^)]*)\)/g, (match, id) =>
        ids.has(id) ? `url(#${ids.get(id)})` : match,
      );
      if (attribute.name === "href" || attribute.name === "xlink:href") {
        if (value.startsWith("#") && ids.has(value.slice(1)))
          value = `#${ids.get(value.slice(1))}`;
      } else if (
        attribute.name === "aria-labelledby" ||
        attribute.name === "aria-describedby"
      ) {
        value = value
          .split(" ")
          .map((id) => ids.get(id) ?? id)
          .join(" ");
      }
      if (value !== attribute.value) node.setAttribute(attribute.name, value);
    }
  });
  host.replaceChildren(clone);

  const scrollRegions =
    ".screen-scroll, .social-detail, .project-detail, .contribution-scroll, .menu-options";
  const scrolled = source.querySelectorAll(scrollRegions);
  clone.querySelectorAll(scrollRegions).forEach((node, index) => {
    node.scrollTop = scrolled[index]!.scrollTop;
    node.scrollLeft = scrolled[index]!.scrollLeft;
  });
}
