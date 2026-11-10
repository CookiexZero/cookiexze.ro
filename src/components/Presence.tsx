import { useEffect, useState } from "react";
import { siSpotify } from "simple-icons";
import {
  ACTIVITY_CUSTOM_STATUS,
  ACTIVITY_LISTENING,
  activityImageUrl,
  type LanyardActivity,
  type LanyardData,
} from "../lib/discord";

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

const pad = (n: number) => String(n).padStart(2, "0");

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
  0: "Играет в",
  1: "Стримит",
  2: "Слушает",
  3: "Смотрит",
  5: "Соревнуется в",
};

export function Presence({ presence }: { presence: LanyardData }) {
  const spotify = presence.listening_to_spotify ? presence.spotify : null;

  // Spotify gets its own card, so drop it (and the custom status, which is
  // rendered next to the username) from the generic activity list.
  const activities = presence.activities.filter(
    (activity) =>
      activity.type !== ACTIVITY_CUSTOM_STATUS &&
      !(activity.type === ACTIVITY_LISTENING && activity.name === "Spotify"),
  );

  if (!spotify && activities.length === 0) {
    return (
      <p className="data-message">
        Сейчас нет публичной активности. Возможно, просто отдыхаю.
      </p>
    );
  }

  return (
    <div className="presence-list">
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
  spotify: NonNullable<LanyardData["spotify"]>;
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
      className="presence-card"
    >
      <img
        src={spotify.album_art_url}
        alt={spotify.album}
        className="presence-art"
        width="56"
        height="56"
        loading="lazy"
      />
      <div className="presence-copy">
        <div className="presence-label">
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
        <p className="presence-title">{spotify.song}</p>
        <p className="presence-detail">{spotify.artist}</p>

        <div>
          <div
            className="spotify-progress"
            role="progressbar"
            aria-label="Воспроизведение трека"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
          <span className="presence-timer block">
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
  const smallImage = activityImageUrl(activity, "small_image");

  return (
    <div className="presence-card">
      <div className="presence-image">
        {image ? (
          <img
            src={image}
            alt={activity.assets?.large_text ?? activity.name}
            className="presence-art"
            width="56"
            height="56"
            loading="lazy"
          />
        ) : (
          <div className="presence-art presence-fallback">
            {activity.name.charAt(0).toUpperCase()}
          </div>
        )}
        {smallImage && (
          <img
            src={smallImage}
            alt={activity.assets?.small_text ?? ""}
            className="presence-small-art"
            width="23"
            height="23"
            loading="lazy"
          />
        )}
      </div>

      <div className="presence-copy">
        <div className="presence-label">
          {verb[activity.type] ?? "Активность"}
        </div>
        <p className="presence-title">{activity.name}</p>
        {activity.details && (
          <p className="presence-detail">{activity.details}</p>
        )}
        {activity.state && <p className="presence-detail">{activity.state}</p>}
        {start && (
          <p className="presence-timer">{formatDuration(now - start)} в игре</p>
        )}
      </div>
    </div>
  );
}
