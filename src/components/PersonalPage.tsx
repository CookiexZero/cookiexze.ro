import { useEffect, useRef, useState } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { DISCORD_ID, projects, site } from "../config";
import {
  ACTIVITY_CUSTOM_STATUS,
  avatarUrl,
  bannerUrl,
  decorationUrl,
  displayName,
  statusLabel,
  type LanyardData,
} from "../lib/discord";
import { renderInlineMarkdown } from "../lib/markdown";
import { useDiscordProfile } from "../hooks/useDiscordProfile";
import { useLanyard } from "../hooks/useLanyard";
import { ContributionGraph } from "./ContributionGraph";
import { GitHubFeed } from "./GitHubFeed";
import { BrandIcon } from "./Icon";
import { Links } from "./Links";
import { NexusShiyuLogo } from "./NexusShiyuLogo";
import { Presence } from "./Presence";
import { MenuScene } from "./MenuScene";

const SECTIONS = [
  {
    id: "profile",
    title: "PROFILE",
    label: "Профиль",
    description: "Мой профиль из Discord",
  },
  {
    id: "social",
    title: "SOCIAL LINK",
    label: "Контакты",
    description: "Ссылки на мои соц. сети",
  },
  {
    id: "projects",
    title: "PROJECTS",
    label: "Проекты",
    description: "Мои проекты",
  },
  {
    id: "status",
    title: "STATUS",
    label: "Сейчас",
    description: "Активности из Discord",
  },
  {
    id: "github",
    title: "GITHUB",
    label: "Код",
    description: "Контрибуции и последние изменения",
  },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];
type Screen = "menu" | SectionId;

function screenFromHash(): Screen {
  const value = window.location.hash.slice(1);
  if (value === "quest") return "projects";
  return SECTIONS.find((item) => item.id === value)?.id ?? "menu";
}

export default function PersonalPage() {
  const reduced = useReducedMotion();
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: reduced ? 0 : 0.18, ease: "easeOut" }}
    >
      <PersonalMenu />
    </MotionConfig>
  );
}

function PersonalMenu() {
  const reduced = useReducedMotion();
  const { profile } = useDiscordProfile(DISCORD_ID);
  const {
    presence,
    monitored,
    loading: presenceLoading,
  } = useLanyard(DISCORD_ID);
  const [screen, setScreen] = useState<Screen>("menu");
  const [selected, setSelected] = useState(0);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const menuRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const user = profile?.user;
  const customStatus = presence?.activities.find(
    (item) => item.type === ACTIVITY_CUSTOM_STATUS,
  );
  const active =
    SECTIONS.find((item) => item.id === screen) ?? SECTIONS[selected]!;
  const avatar =
    user && !portraitFailed ? avatarUrl(user, 256) : "/favicon-512.png";
  const decoration = user ? decorationUrl(user) : null;
  const banner = user ? bannerUrl(user, 1024) : null;

  const navigate = (next: Screen) => {
    setScreen(next);
    window.location.hash = next;
  };

  useEffect(() => {
    const sync = () => {
      const next = screenFromHash();
      setScreen(next);
      const index = SECTIONS.findIndex((item) => item.id === next);
      if (index >= 0) setSelected(index);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.title =
      screen === "menu"
        ? site.fallbackName
        : `${active.label} / ${site.fallbackName}`;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (screen === "menu") menuRefs.current[selected]?.focus();
    else titleRef.current?.focus({ preventScroll: true });
  }, [screen]);

  const selectMenu = (direction: number) => {
    const focused = menuRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    const next =
      ((focused >= 0 ? focused : selected) + direction + SECTIONS.length) %
      SECTIONS.length;
    setSelected(next);
    menuRefs.current[next]?.focus();
  };

  const changeSection = (direction: number) => {
    const current = SECTIONS.findIndex((item) => item.id === screen);
    navigate(
      SECTIONS[(current + direction + SECTIONS.length) % SECTIONS.length]!.id,
    );
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
        return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]'))
        return;
      if (event.key === "Escape" && screen !== "menu") {
        event.preventDefault();
        navigate("menu");
        return;
      }
      if (screen !== "menu") {
        if (event.key === "[" || event.key === "]") {
          event.preventDefault();
          changeSection(event.key === "[" ? -1 : 1);
        }
        return;
      }
      if (target.closest("a, button:not([data-menu-item])")) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        selectMenu(event.key === "ArrowDown" ? 1 : -1);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : SECTIONS.length - 1;
        setSelected(next);
        menuRefs.current[next]?.focus();
      } else if (event.key === "Enter") {
        event.preventDefault();
        const focused = menuRefs.current.findIndex(
          (node) => node === document.activeElement,
        );
        navigate(SECTIONS[focused >= 0 ? focused : selected]!.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, selected]);

  return (
    <div
      className={`game-shell ${screen === "menu" ? "is-menu" : "is-screen"} screen-${screen}`}
    >
      <MenuScene
        mode={
          screen === "menu"
            ? "menu"
            : screen === "social" || screen === "projects"
              ? "detail"
              : "screen"
        }
      />

      <header className="game-header">
        {screen === "menu" ? (
          <div className="player-tag">
            <img
              src={avatar}
              width="38"
              height="38"
              alt=""
              onError={() => setPortraitFailed(true)}
            />
            <div>
              <span className="player-name">
                {user ? displayName(user) : site.fallbackName}
              </span>
              <span className="player-status">
                <Status presence={presence} loading={presenceLoading} />
              </span>
            </div>
          </div>
        ) : (
          <button className="back-button" onClick={() => navigate("menu")}>
            <span aria-hidden="true">◀</span> МЕНЮ
          </button>
        )}
        <LocalClock />
      </header>

      <main className="game-main" id="main">
        {screen === "menu" ? (
          <section className="main-menu" aria-label="Главное меню">
            <h1 className="sr-only">{site.fallbackName}: главное меню</h1>
            <nav aria-label="Разделы сайта" className="menu-options">
              {SECTIONS.map((item, index) => (
                <motion.button
                  key={item.id}
                  data-menu-item
                  ref={(node) => {
                    menuRefs.current[index] = node;
                  }}
                  className={`menu-option ${index === selected ? "is-selected" : ""}`}
                  initial={false}
                  style={{ skewX: -7 }}
                  animate={{
                    x: index === selected ? -5 : 0,
                    scale: index === selected ? 1.08 : 1,
                  }}
                  whileTap={{ scale: index === selected ? 1.05 : 0.98 }}
                  onPointerMove={() => {
                    if (selected !== index) setSelected(index);
                  }}
                  onFocus={() => setSelected(index)}
                  onClick={() => navigate(item.id)}
                  tabIndex={index === selected ? 0 : -1}
                  aria-label={`${item.title}: ${item.label}`}
                >
                  <span className="menu-option-text">{item.title}</span>
                  <span className="menu-option-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                </motion.button>
              ))}
            </nav>
            <div className="menu-signature" aria-hidden="true">
              {site.fallbackName}.
            </div>
          </section>
        ) : (
          <motion.div
            className="section-screen"
            key={screen}
            initial={{ opacity: 0, x: reduced ? 0 : 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: reduced ? 0 : 0.45,
              delay: reduced ? 0 : 0.13,
            }}
          >
            <nav className="screen-tabs" aria-label="Переключить раздел">
              {SECTIONS.map((item) => (
                <button
                  key={item.id}
                  aria-current={screen === item.id ? "page" : undefined}
                  onClick={() => navigate(item.id)}
                >
                  {item.title}
                </button>
              ))}
            </nav>
            <div className="screen-heading">
              <h1 className="screen-title" tabIndex={-1} ref={titleRef}>
                {active.title}
              </h1>
            </div>

            {screen === "profile" && (
              <div className="screen-body profile-view">
                <section
                  className="screen-scroll profile-record"
                  aria-label="Информация о профиле"
                  tabIndex={0}
                >
                  <div className="record-heading">
                    <span>PERSONAL FILE</span>
                    <span>01 / PROFILE</span>
                  </div>
                  <h2 className="profile-name">
                    {user ? displayName(user) : site.fallbackName}
                  </h2>
                  <p className="profile-handle">
                    @{user?.username ?? site.fallbackName}
                    {profile?.pronouns ? ` / ${profile.pronouns}` : ""}
                  </p>
                  <p className="profile-tagline">{site.tagline}</p>
                  <div className="profile-bio">
                    {renderInlineMarkdown(
                      site.bio ||
                        profile?.bio ||
                        "Пишу код, собираю пэт-проекты и зависаю в любимых комьюнити.",
                    )}
                  </div>
                  <dl className="profile-facts">
                    <div>
                      <dt>LOCATION</dt>
                      <dd>{site.location}</dd>
                    </div>
                    <div>
                      <dt>DISCORD</dt>
                      <dd>
                        <Status presence={presence} loading={presenceLoading} />
                      </dd>
                    </div>
                  </dl>
                  {customStatus?.state && (
                    <p className="custom-status">
                      {customStatus.emoji &&
                        (customStatus.emoji.id ? (
                          <img
                            src={`https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? "gif" : "png"}?size=32`}
                            width="18"
                            height="18"
                            alt={customStatus.emoji.name}
                          />
                        ) : (
                          <span aria-hidden="true">
                            {customStatus.emoji.name}
                          </span>
                        ))}{" "}
                      {customStatus.state}
                    </p>
                  )}
                </section>
                <aside className="profile-card" aria-label="Аватар Discord">
                  {banner && (
                    <img
                      className="profile-banner"
                      src={banner}
                      width="600"
                      height="200"
                      alt="Баннер профиля Discord"
                    />
                  )}
                  <div className="profile-avatar">
                    <img
                      src={avatar}
                      width="160"
                      height="160"
                      alt={`Аватар ${user ? displayName(user) : site.fallbackName}`}
                      onError={() => setPortraitFailed(true)}
                    />
                    {decoration && (
                      <img
                        className="profile-decoration"
                        src={decoration}
                        width="192"
                        height="192"
                        alt=""
                      />
                    )}
                  </div>
                  <p>{user ? displayName(user) : site.fallbackName}</p>
                  <span>DISCORD PROFILE</span>
                </aside>
              </div>
            )}

            {screen === "social" && <Links />}
            {screen === "projects" && <Projects />}
            {screen === "status" && (
              <div className="screen-body status-view">
                <section
                  className="screen-scroll live-record"
                  aria-label="Текущая активность Discord"
                  tabIndex={0}
                >
                  <div className="record-heading">
                    <span>LIVE ACTIVITY</span>
                    <Status presence={presence} loading={presenceLoading} />
                  </div>
                  {presenceLoading ? (
                    <p className="data-loading" role="status">
                      Подключаюсь к Discord…
                    </p>
                  ) : presence && monitored ? (
                    <Presence presence={presence} />
                  ) : (
                    <p className="data-message">
                      Текущая активность недоступна.{" "}
                      <a
                        href={`https://discord.com/users/${DISCORD_ID}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Открыть профиль Discord
                      </a>
                    </p>
                  )}
                </section>
                <div className="screen-art-label" aria-hidden="true">
                  NOW
                  <br />
                  <span>PLAYING.</span>
                </div>
              </div>
            )}
            {screen === "github" && (
              <div className="screen-body github-view">
                <section
                  className="screen-scroll github-record"
                  aria-label="Контрибуции и события GitHub"
                  tabIndex={0}
                >
                  <div className="record-heading">
                    <span>DEVELOPMENT LOG</span>
                    <BrandIcon name="github" />
                  </div>
                  <ContributionGraph />
                  <h2 className="feed-title">Последние события</h2>
                  <GitHubFeed />
                </section>
                <div className="screen-art-label" aria-hidden="true">
                  COMMIT.
                  <br />
                  <span>PUSH.</span>
                  <br />
                  <span>REPEAT.</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <footer className="game-footer">
        <a
          className="source-link"
          aria-label="Исходный код страницы"
          href={site.repo}
          target="_blank"
          rel="noreferrer noopener"
        >
          <BrandIcon name="github" className="h-4 w-4" />
          <span>Исходный код</span>
        </a>
        <div className="command-guide">
          <p key={active.id}>
            {screen === "menu" ? active.description : active.label}
          </p>
          <div className="command-controls">
            {screen === "menu" ? (
              <>
                <span className="key-hint">
                  <kbd>↑</kbd>
                  <kbd>↓</kbd> Выбор
                </span>
                <button onClick={() => navigate(SECTIONS[selected]!.id)}>
                  <kbd>Enter</kbd> Открыть
                </button>
              </>
            ) : (
              <>
                <button
                  className="section-step"
                  aria-label="Предыдущий раздел"
                  onClick={() => changeSection(-1)}
                >
                  <kbd>[</kbd> Пред.
                </button>
                <button
                  className="section-step"
                  aria-label="Следующий раздел"
                  onClick={() => changeSection(1)}
                >
                  <kbd>]</kbd> След.
                </button>
                <button onClick={() => navigate("menu")}>
                  <kbd>Esc</kbd> Назад
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
      {!reduced && (
        <motion.div
          className="scene-wipe"
          key={`wipe-${screen}`}
          aria-hidden="true"
          style={{ skewX: -18 }}
          initial={{ x: "-130%" }}
          animate={{ x: ["-130%", "-5%", "130%"] }}
          transition={{
            duration: 0.48,
            times: [0, 0.45, 1],
            ease: [0.75, 0, 0.25, 1],
          }}
        />
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {screen === "menu"
          ? `Главное меню. ${active.label}`
          : `Открыт раздел: ${active.label}`}
      </span>
    </div>
  );
}

function Status({
  presence,
  loading,
}: {
  presence: LanyardData | null;
  loading: boolean;
}) {
  return (
    <span
      className={`profile-status status-${presence?.discord_status ?? "unknown"}`}
    >
      <span className="status-dot" aria-hidden="true" />
      {loading
        ? "Подключение…"
        : presence
          ? statusLabel[presence.discord_status]
          : "Статус недоступен"}
    </span>
  );
}

function LocalClock() {
  const [date, setDate] = useState<Date | null>(null);
  useEffect(() => {
    setDate(new Date());
    const timer = setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="local-clock">
      <span>
        {date
          ? date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
            })
          : "--/--"}
      </span>
      <div>
        <b>
          {date
            ? date
                .toLocaleDateString("en-US", { weekday: "short" })
                .toUpperCase()
            : "DAY"}
        </b>
        <span>
          {date
            ? date.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"}{" "}
          / LOCAL
        </span>
      </div>
    </div>
  );
}

function Projects() {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const available = projects.flatMap((project, index) =>
    project ? [index] : [],
  );
  const item = projects[selected]!;
  return (
    <div className="screen-body projects-view">
      <nav
        className="screen-scroll project-options"
        aria-label="Мои проекты"
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          const focused = refs.current.findIndex(
            (node) => node === document.activeElement,
          );
          const current = available.indexOf(focused >= 0 ? focused : selected);
          const next =
            available[
              (current +
                (event.key === "ArrowDown" ? 1 : -1) +
                available.length) %
                available.length
            ]!;
          setSelected(next);
          refs.current[next]?.focus();
        }}
      >
        <span className="list-caption">
          PROJECT LIST / {String(available.length).padStart(2, "0")}
        </span>
        {projects.map((project, index) => (
          <motion.button
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            className={`project-option list-option ${selected === index ? "is-selected" : ""}`}
            disabled={!project}
            aria-label={
              project ? project.title : `Проект ${index + 1} недоступен`
            }
            aria-pressed={project ? selected === index : undefined}
            onFocus={project ? () => setSelected(index) : undefined}
            onClick={project ? () => setSelected(index) : undefined}
            initial={false}
            animate={{ x: project && selected === index ? 7 : 0 }}
            whileTap={project ? { scale: 0.98 } : undefined}
          >
            <span className="list-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            {project ? (
              <span>{project.title}</span>
            ) : (
              <span className="project-unavailable" aria-hidden="true">
                ×
              </span>
            )}
          </motion.button>
        ))}
      </nav>
      <motion.section
        className="project-detail"
        key={selected}
        aria-labelledby="project-detail-title"
        initial={{ opacity: 0, x: reduced ? 0 : 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduced ? 0 : 0.25 }}
      >
        <span className="detail-overline">PROJECT / 0{selected + 1}</span>
        <div className="project-symbol" aria-hidden="true">
          <NexusShiyuLogo className="project-logo" />
        </div>
        <h2 id="project-detail-title">{item.title}</h2>
        <p>{item.description}</p>
        {item.logo === "nexus-shiyu" && (
          <a
            className="confirm-link"
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
          >
            Открыть Nexus Shiyu <span aria-hidden="true">↗</span>
          </a>
        )}
      </motion.section>
    </div>
  );
}
