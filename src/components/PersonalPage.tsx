import type { ReactNode } from 'react';
import { DISCORD_ID, doing, site } from '../config';
import {
  ACTIVITY_CUSTOM_STATUS,
  accentHex,
  avatarUrl,
  bannerUrl,
  decorationUrl,
  displayName,
  statusColor,
  statusLabel,
  type DiscordProfile,
  type LanyardData,
} from '../lib/discord';
import { renderInlineMarkdown } from '../lib/markdown';
import { useDiscordProfile } from '../hooks/useDiscordProfile';
import { useLanyard } from '../hooks/useLanyard';
import { ContributionGraph } from './ContributionGraph';
import { GitHubFeed } from './GitHubFeed';
import { BrandIcon } from './Icon';
import { Links } from './Links';
import { NexusShiyuLogo } from './NexusShiyuLogo';
import { Presence } from './Presence';

export default function PersonalPage() {
  const { profile, loading, error } = useDiscordProfile(DISCORD_ID);
  const { presence, monitored } = useLanyard(DISCORD_ID);

  return (
    <main className="pb-16">
      <Header profile={profile} presence={presence} loading={loading} />

      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:max-w-6xl lg:px-8">
        {error && !profile && (
          <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            Не удалось загрузить профиль Discord: {error}
          </p>
        )}

        {/*
          One column on mobile, a 2x2 grid from `lg`: links beside doing on the
          first row, Discord beside GitHub on the second. Laying it out by rows
          rather than by columns is what keeps "Сейчас" and "GitHub" starting on
          the same line no matter which block above them is taller.
        */}
        <div className="mt-10 grid items-start gap-y-10 lg:grid-cols-2 lg:gap-x-12">
          <Section title="Ссылки">
            <Links />
          </Section>

          <Section title="Чем занимаюсь">
            <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {doing.map((item) => (
                <li
                  key={item.title}
                  className="rounded-3xl border border-zinc-200/80 bg-white p-5"
                >
                  <span className="flex h-7 items-center">
                    {item.logo === 'nexus-shiyu' ? (
                      <NexusShiyuLogo className="h-7 w-auto" />
                    ) : (
                      <span aria-hidden="true" className="text-lg">
                        {item.emoji}
                      </span>
                    )}
                  </span>
                  <p className="mt-2 text-sm font-medium text-zinc-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Сейчас">
            {monitored ? (
              presence ? (
                <Presence presence={presence} />
              ) : (
                <div className="h-24 animate-pulse rounded-3xl bg-zinc-100" />
              )
            ) : (
              <p className="rounded-3xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
                Статус недоступен — аккаунт не отслеживается Lanyard.{' '}
                <a
                  href="https://discord.gg/lanyard"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-zinc-600 underline underline-offset-2"
                >
                  Зайти на сервер Lanyard
                </a>
                , чтобы включить.
              </p>
            )}
          </Section>

          <Section title="GitHub">
            <ContributionGraph />
            <div className="mt-3">
              <GitHubFeed />
            </div>
          </Section>
        </div>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-zinc-200/70 pt-6 text-xs text-zinc-400">
          <span>
            Аватар, баннер и статус тянутся из Discord в реальном времени.
          </span>
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-zinc-500 transition hover:text-zinc-900"
          >
            <BrandIcon name="github" className="h-3.5 w-3.5" />
            Исходный код этой страницы
          </a>
        </footer>
      </div>
    </main>
  );
}

function Header({
  profile,
  presence,
  loading,
}: {
  profile: DiscordProfile | null;
  presence: LanyardData | null;
  loading: boolean;
}) {
  const user = profile?.user;
  const banner = user ? bannerUrl(user, 2048) : null;
  const accent = user ? accentHex(user) : null;
  const decoration = user ? decorationUrl(user) : null;
  const status = presence?.discord_status ?? 'offline';
  const customStatus = presence?.activities.find(
    (activity) => activity.type === ACTIVITY_CUSTOM_STATUS,
  );

  return (
    // The banner runs edge to edge at every width; the text below it lines up
    // with the page container.
    <header className="border-b border-zinc-200/70">
      <div
        className="h-40 w-full bg-zinc-100 bg-cover bg-center sm:h-56 lg:h-72 xl:h-80"
        style={{
          // Discord falls back to the profile accent colour when there is no
          // banner image; mirror that instead of showing an empty grey block.
          backgroundImage: banner
            ? `url(${banner})`
            : accent
              ? `linear-gradient(135deg, ${accent}, ${accent}99)`
              : undefined,
        }}
        role="img"
        aria-label={banner ? 'Баннер профиля Discord' : ''}
      />

      <div className="mx-auto w-full max-w-2xl px-4 pb-6 sm:px-6 lg:max-w-6xl lg:px-8 lg:pb-10">
        <div className="-mt-12 sm:-mt-14 lg:-mt-20 lg:flex lg:items-end lg:gap-7">
          {/* Sized explicitly: the decoration and the status dot are absolutely
              positioned against this box, so it must not stretch to the full
              container width when the row is not a flex row yet. */}
          <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28 lg:h-36 lg:w-36">
            {user ? (
              <img
                src={avatarUrl(user, 512)}
                alt={`Аватар ${displayName(user)}`}
                className="h-24 w-24 rounded-full bg-white object-cover ring-4 ring-white sm:h-28 sm:w-28 lg:h-36 lg:w-36 lg:ring-[6px]"
              />
            ) : (
              <div className="h-24 w-24 animate-pulse rounded-full bg-zinc-200 ring-4 ring-white sm:h-28 sm:w-28 lg:h-36 lg:w-36 lg:ring-[6px]" />
            )}

            {decoration && (
              <img
                src={decoration}
                alt=""
                aria-hidden="true"
                // The decoration frame is drawn at ~1.2x the avatar box and
                // centred on it, matching how Discord composites the two.
                className="pointer-events-none absolute top-1/2 left-1/2 h-[120%] w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2"
              />
            )}

            <span
              className={`absolute right-1 bottom-1 h-5 w-5 rounded-full ring-4 ring-white sm:h-6 sm:w-6 lg:right-2 lg:bottom-2 lg:h-7 lg:w-7 lg:ring-[5px] ${statusColor[status]}`}
              title={statusLabel[status]}
              aria-label={statusLabel[status]}
              role="status"
            />
          </div>

          <div className="mt-4 min-w-0 lg:mt-0 lg:flex-1 lg:pb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 lg:text-3xl">
              {user ? displayName(user) : loading ? ' ' : site.fallbackName}
            </h1>
            <p className="mt-0.5 font-mono text-sm text-zinc-400">
              @{user?.username ?? site.fallbackName}
              {profile?.pronouns ? ` · ${profile.pronouns}` : ''}
            </p>

            {customStatus && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">
                {customStatus.emoji && (
                  <StatusEmoji emoji={customStatus.emoji} />
                )}
                {customStatus.state}
              </p>
            )}
          </div>
        </div>

        {/* `break-words` so a long unbroken string in the Discord bio (a URL, a
            row of dashes) can't push the page sideways on a phone. */}
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed wrap-break-word whitespace-pre-line text-zinc-600 lg:mt-5">
          {renderInlineMarkdown(site.bio || profile?.bio || site.tagline)}
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {site.location}
        </p>
      </div>
    </header>
  );
}

function StatusEmoji({
  emoji,
}: {
  emoji: { id?: string; name: string; animated?: boolean };
}) {
  if (!emoji.id) return <span aria-hidden="true">{emoji.name}</span>;
  return (
    <img
      src={`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=32`}
      alt={emoji.name}
      className="h-4 w-4"
    />
  );
}

function Section({
  title,
  className = '',
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="mb-3 text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
