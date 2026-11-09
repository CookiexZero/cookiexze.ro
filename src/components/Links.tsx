import { useRef, useState } from "react";
import { links } from "../config";
import { BrandIcon } from "./Icon";

export function Links() {
  const [selected, setSelected] = useState(0);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const active = links[selected]!;
  return (
    <div className="screen-body social-view">
      <nav
        className="screen-scroll social-options"
        aria-label="Социальные сети и контакты"
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          // Follow keyboard focus even when the pointer previews another row.
          const focused = refs.current.findIndex(
            (node) => node === document.activeElement,
          );
          const next =
            ((focused >= 0 ? focused : selected) +
              (event.key === "ArrowDown" ? 1 : -1) +
              links.length) %
            links.length;
          setSelected(next);
          refs.current[next]?.focus();
        }}
      >
        <span className="list-caption">
          SOCIAL LIST / {String(links.length).padStart(2, "0")}
        </span>
        {links.map(({ icon, label, handle, href }, index) => (
          <a
            key={label}
            ref={(node) => {
              refs.current[index] = node;
            }}
            className={`social-option list-option ${index === selected ? "is-selected" : ""}`}
            href={href}
            onPointerMove={() => {
              if (selected !== index) setSelected(index);
            }}
            onFocus={() => setSelected(index)}
            {...(!href.startsWith("mailto:")
              ? { target: "_blank", rel: "noreferrer noopener" }
              : {})}
          >
            <span className="list-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`social-symbol ${icon === "nexus-shiyu" ? "symbol-nexus" : ""}`}
            >
              <BrandIcon name={icon} className="h-6 w-6" />
            </span>
            <span className="social-label">
              {label}
              <span>{handle}</span>
            </span>
            <span className="social-open" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </nav>
      <aside
        className="social-detail"
        key={selected}
        aria-label={`Выбран ${active.label}`}
      >
        <span className="detail-overline">CONNECTION / 0{selected + 1}</span>
        <div
          className={`detail-brand ${active.icon === "nexus-shiyu" ? "detail-brand-nexus" : ""}`}
        >
          <BrandIcon name={active.icon} className="h-full w-full" />
        </div>
        <h2>{active.label}</h2>
        <p>{active.handle}</p>
        <a
          className="confirm-link"
          href={active.href}
          {...(!active.href.startsWith("mailto:")
            ? { target: "_blank", rel: "noreferrer noopener" }
            : {})}
        >
          {active.icon === "mail" ? "Написать письмо" : "Открыть профиль"}
          <span aria-hidden="true">↗</span>
        </a>
      </aside>
    </div>
  );
}
