import { useEffect, useState } from 'react';
import { siSpotify } from 'simple-icons';
import {
  ACTIVITY_CUSTOM_STATUS,
  ACTIVITY_LISTENING,
  activityImageUrl,
  type LanyardActivity,
  type LanyardData,
} from '../lib/discord';

/** A once-a-second clock, shared by the elapsed timers and progress bars. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

const pad = (n: number) => String(n).padStart(2, '0');

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

const verb: Record<number, string> = {
  0: 'Играет в',
  1: 'Стримит',
  2: 'Слушает',
  3: 'Смотрит',
  5: 'Соревнуется в',
};

export function Presence({ presence }: { presence: LanyardData }) {
  const spotify = presence.listening_to_spotify ? presence.spotify : null;

  // Spotify gets its own card, so drop it (and the custom status, which is
  // rendered next to the username) from the generic activity list.
  const activities = presence.activities.filter(
    (activity) =>
      activity.type !== ACTIVITY_CUSTOM_STATUS &&
      !(activity.type === ACTIVITY_LISTENING && activity.name === 'Spotify'),
  );

  if (!spotify && activities.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
        Сейчас ничем не занят
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {spotify && <SpotifyCard spotify={spotify} />}
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function SpotifyCard({
  spotify,
}: {
  spotify: NonNullable<LanyardData['spotify']>;
}) {
  const now = useNow(true);
  const { start, end } = spotify.timestamps;
  const total = Math.max(1, end - start);
  const elapsed = Math.min(Math.max(0, now - start), total);
  const progress = (elapsed / total) * 100;

  return (
    <a
      href={`https://open.spotify.com/track/${spotify.track_id}`}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex gap-4 rounded-3xl border border-zinc-200/80 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
    >
      <img
        src={spotify.album_art_url}
        alt={spotify.album}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-emerald-600 uppercase">
          <svg
            role="img"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d={siSpotify.path} />
          </svg>
          Слушает сейчас
        </div>
        <p className="mt-1 truncate font-medium text-zinc-900">
          {spotify.song}
        </p>
        <p className="truncate text-sm text-zinc-500">{spotify.artist}</p>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] text-zinc-400 tabular-nums">
            {formatDuration(elapsed)} / {formatDuration(total)}
          </span>
        </div>
      </div>
    </a>
  );
}

function ActivityCard({ activity }: { activity: LanyardActivity }) {
  const start = activity.timestamps?.start;
  const now = useNow(Boolean(start));
  const image = activityImageUrl(activity);
  const smallImage = activityImageUrl(activity, 'small_image');

  return (
    <div className="flex gap-4 rounded-3xl border border-zinc-200/80 bg-white p-4">
      <div className="relative h-16 w-16 shrink-0">
        {image ? (
          <img
            src={image}
            alt={activity.assets?.large_text ?? activity.name}
            className="h-16 w-16 rounded-2xl object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-xl font-semibold text-zinc-400">
            {activity.name.charAt(0).toUpperCase()}
          </div>
        )}
        {smallImage && (
          <img
            src={smallImage}
            alt={activity.assets?.small_text ?? ''}
            className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full ring-2 ring-white"
            loading="lazy"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-wide text-indigo-600 uppercase">
          {verb[activity.type] ?? 'Активность'}
        </div>
        <p className="mt-1 truncate font-medium text-zinc-900">
          {activity.name}
        </p>
        {activity.details && (
          <p className="truncate text-sm text-zinc-500">{activity.details}</p>
        )}
        {activity.state && (
          <p className="truncate text-sm text-zinc-500">{activity.state}</p>
        )}
        {start && (
          <p className="mt-1 font-mono text-[11px] text-zinc-400 tabular-nums">
            {formatDuration(now - start)} в игре
          </p>
        )}
      </div>
    </div>
  );
}
